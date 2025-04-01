---
sidebar_label: 'dbt'
slug: /integrations/dbt
sidebar_position: 1
description: 'Пользователи могут преобразовывать и моделировать свои данные в ClickHouse, используя dbt'
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

**dbt** (инструмент построения данных) позволяет инженерам аналитики преобразовывать данные в своих хранилищах, просто написав операторы select. dbt обрабатывает материализацию этих операторов select в объекты в базе данных в форме таблиц и представлений, выполняя T из [Extract Load and Transform (ELT)](https://en.wikipedia.org/wiki/Extract,_load,_transform). Пользователи могут создавать модели, определяемые оператором SELECT.

Внутри dbt эти модели могут ссылаться друг на друга и быть структурированы так, чтобы позволить создание концепций более высокого уровня. Шаблонный SQL, необходимый для соединения моделей, автоматически генерируется. Более того, dbt определяет зависимости между моделями и обеспечивает их создание в соответствующем порядке с использованием ориентированного ациклического графа (DAG).

Dbt совместим с ClickHouse через [плагин, поддерживаемый ClickHouse](https://github.com/ClickHouse/dbt-clickhouse). Мы описываем процесс подключения ClickHouse с простым примером на основе общедоступного набора данных IMDB. Мы также подчеркиваем некоторые из ограничений текущего соединителя.

<TOCInline toc={toc}  maxHeadingLevel={2} />
## Концепции {#concepts}

dbt вводит концепцию модели. Это определяется как SQL-оператор, потенциально объединяющий множество таблиц. Модель может быть "материализована" несколькими способами. Материализация представляет стратегию построения для select-запроса модели. Код, связанный с материализацией, — это шаблонный SQL, который оборачивает ваш SELECT-запрос в оператор для создания нового или обновления уже существующего отношения.

dbt предоставляет 4 типа материализации:

* **представление** (по умолчанию): Модель создается как представление в базе данных.
* **таблица**: Модель создается как таблица в базе данных.
* **временная**: Модель непосредственно не создается в базе данных, а вместо этого включается в зависимые модели в качестве общих табличных выражений.
* **инкрементальная**: Модель изначально материализуется как таблица, а в последующих запусках dbt вставляет новые строки и обновляет измененные строки в таблице.

Дополнительный синтаксис и предложения определяют, как эти модели должны обновляться, если их исходные данные изменяются. dbt обычно рекомендует начинать с материализации представления, пока производительность не станет проблемой. Материализация таблицы обеспечивает улучшение производительности времени запроса за счет захвата результатов запроса модели как таблицы, что приводит к увеличению объема хранимых данных. Инкрементальный подход строится на этом дальше, чтобы позволить захватывать последующие обновления исходных данных в целевой таблице.

[Текущий плагин](https://github.com/silentsokolov/dbt-clickhouse) для ClickHouse поддерживает **представление**, **таблицу**, **временную** и **инкрементальную** материализации. Плагин также поддерживает [снимки](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy) и [сиды](https://docs.getdbt.com/docs/building-a-dbt-project/seeds), которые мы исследуем в этом руководстве.

Для следующих руководств мы предполагаем, что у вас есть доступ к экземпляру ClickHouse.
## Настройка dbt и плагина ClickHouse {#setup-of-dbt-and-the-clickhouse-plugin}
### dbt {#dbt}

Мы предполагаем использование dbt CLI для следующих примеров. Пользователи также могут рассмотреть [dbt Cloud](https://docs.getdbt.com/docs/dbt-cloud/cloud-overview), который предлагает веб-основу, позволяющую пользователям редактировать и запускать проекты.

dbt предлагает несколько вариантов установки CLI. Следуйте инструкциям, описанным [здесь](https://docs.getdbt.com/dbt-cli/install/overview). На этом этапе установите только dbt-core. Мы рекомендуем использовать `pip`.

```bash
pip install dbt-core
```

**Важно: Следующее проверено на python 3.9.**
### Плагин ClickHouse {#clickhouse-plugin}

Установите плагин dbt ClickHouse:

```bash
pip install dbt-clickhouse
```
### Подготовка ClickHouse {#prepare-clickhouse}

dbt отлично справляется с моделированием высоко реляционных данных. В целях примера мы предоставляем небольшую выборку данных IMDB с следующей реляционной схемой. Этот набор данных взят из [репозитория реляционных наборов данных](https://relational.fit.cvut.cz/dataset/IMDb). Это тривиально по сравнению с общими схемами, используемыми с dbt, но представляет собой управляемую выборку:


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
Столбец `created_at` для таблицы `roles` по умолчанию принимает значение `now()`. Мы используем это позже, чтобы определить инкрементальные обновления наших моделей - см. [Инкрементальные модели](#creating-an-incremental-materialization).
:::

Мы используем функцию `s3`, чтобы прочитать исходные данные из общедоступных конечных точек для вставки данных. Выполните следующие команды, чтобы заполнить таблицы:

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

Время выполнения этих команд может варьироваться в зависимости от вашей пропускной способности, но каждая должна занять всего несколько секунд для завершения. Выполните следующий запрос, чтобы вычислить сводку по каждому актеру, упорядочивая по количеству появлений в фильмах, и подтвердить, что данные загружены успешно:

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

Ответ должен выглядеть так:

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

1. Создайте проект dbt. В данном случае мы назовем его в честь нашего источника `imdb`. Когда вам будет предложено, выберите `clickhouse` в качестве источника базы данных.

    ```bash
    clickhouse-user@clickhouse:~$ dbt init imdb

    16:52:40  Используется dbt=1.1.0
    Какую базу данных вы хотите использовать?
    [1] clickhouse

    (Не видите нужный вам? https://docs.getdbt.com/docs/available-adapters)

    Введите номер: 1
    16:53:21  Образец профиля для clickhouse не найден.
    16:53:21
    Ваш новый проект dbt "imdb" был создан!

    Для получения дополнительной информации о том, как настроить файл profiles.yml,
    пожалуйста, обратитесь к документации dbt здесь:

    https://docs.getdbt.com/docs/configure-your-profile
    ```

2. Перейдите в папку вашего проекта:

    ```bash
    cd imdb
    ```

3. На этом этапе вам потребуется текстовый редактор на ваш выбор. В следующих примерах мы используем популярный VS Code. Открыв каталог IMDB, вы должны увидеть коллекцию файлов yml и sql:

    <Image img={dbt_02} size="lg" alt="Новый проект dbt" />

4. Обновите файл `dbt_project.yml`, чтобы указать нашу первую модель - `actor_summary` и установить профиль на `clickhouse_imdb`.

    <Image img={dbt_03} size="lg" alt="профиль dbt" />

    <Image img={dbt_04} size="lg" alt="профиль dbt" />

5. Далее нам необходимо предоставить dbt данные для подключения к нашему экземпляру ClickHouse. Добавьте следующее в файл `~/.dbt/profiles.yml`.

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

6. Из каталога IMDB выполните команду `dbt debug`, чтобы подтвердить, может ли dbt подключаться к ClickHouse.

    ```bash
    clickhouse-user@clickhouse:~/imdb$ dbt debug
    17:33:53  Используется dbt=1.1.0
    версия dbt: 1.1.0
    версия python: 3.10.1
    путь python: /home/dale/.pyenv/versions/3.10.1/bin/python3.10
    информация об ОС: Linux-5.13.0-10039-tuxedo-x86_64-with-glibc2.31
    Используемый файл profiles.yml в /home/dale/.dbt/profiles.yml
    Используемый файл dbt_project.yml в /opt/dbt/imdb/dbt_project.yml

    Конфигурация:
    файл profiles.yml [OK найден и действителен]
    файл dbt_project.yml [OK найден и действителен]

    Необходимые зависимости:
    - git [OK найден]

    Подключение:
    host: localhost
    port: 8123
    user: default
    schema: imdb_dbt
    secure: False
    verify: False
    Тест подключения: [OK подключение успешно]

    Все проверки пройдены!
    ```

    Подтвердите, что ответ включает `Тест подключения: [OK подключение успешно]`, указывающее на успешное подключение.
## Создание простой материализации представления {#creating-a-simple-view-materialization}

При использовании материализации представления модель восстанавливается как представление при каждом запуске с помощью оператора `CREATE VIEW AS` в ClickHouse. Это не требует дополнительных затрат на хранение данных, но будет медленнее для выполнения запросов, чем материализации таблиц.

1. Из папки `imdb` удалите каталог `models/example`:

    ```bash
    clickhouse-user@clickhouse:~/imdb$ rm -rf models/example
    ```

2. Создайте новый файл в каталоге `actors` внутри папки `models`. Здесь мы создаем файлы, каждый из которых представляет модель актера:

    ```bash
    clickhouse-user@clickhouse:~/imdb$ mkdir models/actors
    ```

3. Создайте файлы `schema.yml` и `actor_summary.sql` в папке `models/actors`.

    ```bash
    clickhouse-user@clickhouse:~/imdb$ touch models/actors/actor_summary.sql
    clickhouse-user@clickhouse:~/imdb$ touch models/actors/schema.yml
    ```
    Файл `schema.yml` определяет наши таблицы. Эти таблицы впоследствии будут доступны для использования в макросах. Отредактируйте
    файл `models/actors/schema.yml`, чтобы он содержал следующий контент:
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
    Файл `actors_summary.sql` определяет нашу фактическую модель. Обратите внимание, что в функции конфигурации мы также запрашиваем, чтобы модель была материализирована как представление в ClickHouse. Наши таблицы ссылаются на файл `schema.yml` через функцию `source`, например, `source('imdb', 'movies')` относится к таблице `movies` в базе данных `imdb`. Отредактируйте файл `models/actors/actors_summary.sql`, чтобы он содержал следующий контент:
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
    Обратите внимание, как мы включаем столбец `updated_at` в нашу финальную actor_summary. Мы используем это позже для инкрементальных материализаций.

4. Из каталога `imdb` выполните команду `dbt run`.

    ```bash
    clickhouse-user@clickhouse:~/imdb$ dbt run
    15:05:35  Используется dbt=1.1.0
    15:05:35  Найден 1 модель, 0 тестов, 1 снимок, 0 анализов, 181 макросов, 0 операций, 0 файлов семян, 6 источников, 0 экспозиций, 0 метрик
    15:05:35
    15:05:36  Конкуренция: 1 поток (target='dev')
    15:05:36
    15:05:36  1 из 1 ЗАПУСК модели представления imdb_dbt.actor_summary.................................. [RUN]
    15:05:37  1 из 1 УСПЕХ создано модель представления imdb_dbt.actor_summary............................. [OK за 1.00с]
    15:05:37
    15:05:37  Завершено выполнение 1 модели представления за 1.97с.
    15:05:37
    15:05:37  Завершено успешно
    15:05:37
    15:05:37  Готово. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
    ```

5. dbt представит модель как представление в ClickHouse, как и запрашивалось. Теперь мы можем запросить это представление напрямую. Это представление будет создано в базе данных `imdb_dbt` - это определяется параметром схемы в файле `~/.dbt/profiles.yml` под профилем `clickhouse_imdb`.

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

В предыдущем примере наша модель была материализирована как представление. Хотя это может быть достаточно для некоторых запросов, более сложные SELECT или часто выполняемые запросы могут быть лучше материализированы как таблица. Эта материализация полезна для моделей, которые будут запрашиваться BI-инструментами, чтобы обеспечить более быстрое взаимодействие пользователей. Это фактически вызывает хранение результатов запроса как новой таблицы с соответствующими затратами на хранение - фактически выполняется `INSERT TO SELECT`. Обратите внимание, что эта таблица будет воссоздаваться каждый раз, то есть она не инкрементальная. Большие наборы данных могут, следовательно, привести к длительным временам выполнения - см. [Ограничения dbt](#limitations).

1. Измените файл `actors_summary.sql` так, чтобы параметр `materialized` был установлен на `table`. Обратите внимание, как определяется `ORDER BY`, и обратите внимание, что мы используем движок таблиц `MergeTree`:

    ```sql
    {{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='table') }}
    ```

2. Из каталога `imdb` выполните команду `dbt run`. Это выполнение может занять немного больше времени - около 10с на большинстве машин.

    ```bash
    clickhouse-user@clickhouse:~/imdb$ dbt run
    15:13:27  Используется dbt=1.1.0
    15:13:27  Найден 1 модель, 0 тестов, 1 снимок, 0 анализов, 181 макросов, 0 операций, 0 файлов семян, 6 источников, 0 экспозиций, 0 метрик
    15:13:27
    15:13:28  Конкуренция: 1 поток (target='dev')
    15:13:28
    15:13:28  1 из 1 ЗАПУСК модели таблицы imdb_dbt.actor_summary................................. [RUN]
    15:13:37  1 из 1 УСПЕХ создано таблицу модели imdb_dbt.actor_summary............................ [OK за 9.22с]
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

4. Подтвердите, что результаты из этой таблицы согласуются с предыдущими ответами. Обратите внимание на заметное улучшение времени ответа теперь, когда модель является таблицей:

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

    Не стесняйтесь выполнять другие запросы к этой модели. Например, какие актеры имеют фильмы с наивысшим рейтингом и более чем 5 появлений?

    ```sql
    SELECT * FROM imdb_dbt.actor_summary WHERE num_movies > 5 ORDER BY avg_rank  DESC LIMIT 10;
    ```

## Создание инкрементного материализованного представления {#creating-an-incremental-materialization}

В предыдущем примере была создана таблица для материализации модели. Эта таблица будет перестраиваться при каждом выполнении dbt. Это может быть непрактично и крайне затратно для больших наборов результатов или сложных преобразований. Чтобы решить эту проблему и уменьшить время сборки, dbt предлагает инкрементные материализации. Это позволяет dbt вставлять или обновлять записи в таблице с момента последнего выполнения, что делает это подходящим для данных в формате событий. За кулисами создается временная таблица со всеми обновленными записями, а затем все неизмененные записи, а также обновленные записи вставляются в новую целевую таблицу. Это приводит к аналогичным [ограничениям](#limitations) для больших наборов результатов, как и для модели таблицы.

Чтобы преодолеть эти ограничения для больших наборов, плагин поддерживает режим «inserts_only», в котором все обновления вставляются в целевую таблицу без создания временной таблицы (подробнее об этом ниже).

Чтобы проиллюстрировать этот пример, мы добавим актера "Clicky McClickHouse", который появится в потрясающих 910 фильмах - убедившись, что он появился в большем количестве фильмов, чем даже [Mel Blanc](https://en.wikipedia.org/wiki/Mel_Blanc).

1. Сначала мы изменяем нашу модель на инкрементную. Это добавление требует:

    1. **unique_key** - Для того чтобы плагин мог уникально идентифицировать строки, мы должны предоставить unique_key - в данном случае поле `id` из нашего запроса будет достаточно. Это гарантирует, что в нашей материализованной таблице не будет дубликатов строк. Для получения дополнительной информации об ограничениях уникальности, смотрите [здесь](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#defining-a-uniqueness-constraint-optional).
    2. **Инкрементный фильтр** - Мы также должны сказать dbt, как он должен определять, какие строки изменились в инкрементном запуске. Это достигается путем предоставления выражения дельты. Обычно это включает временную метку для событийных данных; следовательно, наше поле timestamp обновления. Этот столбец, который по умолчанию устанавливается в значение now() при вставке строк, позволяет идентифицировать новые роли. Кроме того, нам нужно определить альтернативный случай, когда добавляются новые актеры. Используя переменную `{{this}}`, чтобы обозначить существующую материализованную таблицу, мы получаем выражение `where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})`. Мы встраиваем это в условие `{% if is_incremental() %}`, чтобы убедиться, что оно используется только при инкрементных запусках, а не когда таблица впервые строится. Для получения дополнительной информации о фильтрации строк для инкрементальных моделей смотрите [это обсуждение в документации dbt](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#filtering-rows-on-an-incremental-run).

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

    -- этот фильтр будет применяться только при инкрементном запуске
    where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})

    {% endif %}
    ```

    Обратите внимание, что наша модель будет реагировать только на обновления и добавления в таблицы `roles` и `actors`. Чтобы реагировать на все таблицы, пользователям рекомендуется разделять эту модель на несколько подмоделей - каждая со своим инкрементным критерием. Эти модели могут, в свою очередь, быть ссылаемы и соединены. Для получения дополнительной информации о перекрестных ссылках на модели смотрите [здесь](https://docs.getdbt.com/reference/dbt-jinja-functions/ref).

2. Выполните `dbt run` и подтвердите результаты результирующей таблицы:

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

3. Теперь мы добавим данные в нашу модель, чтобы проиллюстрировать инкрементное обновление. Добавим нашего актера "Clicky McClickHouse" в таблицу `actors`:

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

5. Подтвердите, что он на самом деле стал актером с наибольшим количеством появлений, запрашивая исходную таблицу и обходя любые модели dbt:

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

6. Выполните `dbt run` и подтвердите, что наша модель была обновлена и совпадает с вышеуказанными результатами:

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

Мы можем идентифицировать выполненные операторы, чтобы достичь вышеуказанного инкрементного обновления, запросив журнал запросов ClickHouse.

```sql
SELECT event_time, query  FROM system.query_log WHERE type='QueryStart' AND query LIKE '%dbt%'
AND event_time > subtractMinutes(now(), 15) ORDER BY event_time LIMIT 100;
```

Отрегулируйте вышеуказанный запрос по периоду выполнения. Мы оставим проверку результатов пользователю, но выделим общую стратегию, используемую плагином для выполнения инкрементных обновлений:

1. Плагин создает временную таблицу `actor_sumary__dbt_tmp`. Строки, которые изменились, передаются в эту таблицу.
2. Создается новая таблица `actor_summary_new`. Строки из старой таблицы, в свою очередь, передаются из старой в новую, с проверкой, чтобы убедиться, что идентификаторы строк не существуют во временной таблице. Это эффективно обрабатывает обновления и дубликаты.
3. Результаты из временной таблицы передаются в новую таблицу `actor_summary`:
4. Наконец, новая таблица атомарно заменяется старой версией с помощью оператора `EXCHANGE TABLES`. Старая и временная таблицы в свою очередь удаляются.

Ниже это визуализируется:

<Image img={dbt_05} size="lg" alt="инкрементные обновления dbt" />

Эта стратегия может столкнуться с проблемами на очень больших моделях. Для получения дополнительной информации смотрите [Ограничения](#limitations).

### Стратегия добавления (режим inserts-only) {#append-strategy-inserts-only-mode}

Чтобы преодолеть ограничения больших наборов данных в инкрементальных моделях, плагин использует параметр конфигурации dbt `incremental_strategy`. Он может быть установлен в значение `append`. Когда он установлен, обновленные строки вставляются непосредственно в целевую таблицу (или `imdb_dbt.actor_summary`) и временная таблица не создается. 
Примечание: Режим только добавления требует, чтобы ваши данные были неизменяемыми или чтобы дубликаты были приемлемы. Если вы хотите инкрементную модель таблицы, которая поддерживает измененные строки, не используйте этот режим!

Чтобы проиллюстрировать этот режим, мы добавим еще одного нового актера и повторно выполним dbt run с `incremental_strategy='append'`.

1. Настройте режим только добавления в actor_summary.sql:

   ```sql
   {{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='append') }}
   ```

2. Добавим другого известного актера - Дэнни ДеВито

   ```sql
   INSERT INTO imdb.actors VALUES (845467, 'Danny', 'DeBito', 'M');
   ```

3. Пусть Дэнни снимется в 920 случайных фильмах.

   ```sql
   INSERT INTO imdb.roles
   SELECT now() as created_at, 845467 as actor_id, id as movie_id, 'Himself' as role
   FROM imdb.movies
   LIMIT 920 OFFSET 10000;
   ```

4. Выполните dbt run и подтвердите, что Дэнни был добавлен в таблицу actor-summary.

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

Обратите внимание, как это инкрементное обновление было гораздо быстрее по сравнению с вставкой "Clicky".

Проверка в таблице query_log показывает различия между двумя инкрементными запусками:

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
   -- этот фильтр будет применяться только при инкрементном запуске
   where id > (select max(id) from imdb_dbt.actor_summary) or updated_at > (select max(updated_at) from imdb_dbt.actor_summary)
   ```

В этом запуске только новые строки добавляются напрямую в таблицу `imdb_dbt.actor_summary`, и создание таблицы не участвует.

### Режим Delete+Insert (экспериментальный) {#deleteinsert-mode-experimental}

Исторически ClickHouse имел лишь ограниченную поддержку обновлений и удаления в форме асинхронных [мутаций](/sql-reference/statements/alter/index.md). Эти операции могут быть крайне ресурсоемкими и должны, как правило, избегаться.

ClickHouse 22.8 представил [легковесные удаления](/sql-reference/statements/delete.md). Эти операции в настоящее время экспериментальные, но предлагают более производительный способ удаления данных.

Этот режим может быть сконфигурирован для модели через параметр `incremental_strategy`, т.е.

```sql
{{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='delete+insert') }}
```

Эта стратегия работает непосредственно с таблицей целевой модели, поэтому, если возникнет проблема во время выполнения операции, данные в инкрементной модели, вероятно, окажутся в недействительном состоянии - атомарного обновления нет.

Вкратце, этот подход:

1. Плагин создает временную таблицу `actor_sumary__dbt_tmp`. Измененные строки передаются в эту таблицу.
2. Выполняется `DELETE` для текущей таблицы `actor_summary`. Строки удаляются по идентификатору из `actor_sumary__dbt_tmp`.
3. Строки из `actor_sumary__dbt_tmp` вставляются в `actor_summary` с помощью `INSERT INTO actor_summary SELECT * FROM actor_sumary__dbt_tmp`.

Этот процесс показан ниже:

<Image img={dbt_06} size="lg" alt="легковесное удаление инкрементное" />

### Режим insert_overwrite (экспериментальный) {#insert_overwrite-mode-experimental}

Выполняет следующие действия:

1. Создает промежуточную (временную) таблицу с такой же структурой, как у инкрементной модели: `CREATE TABLE {staging} AS {target}`.
2. Вставляет только новые записи (созданные с помощью SELECT) в промежуточную таблицу.
3. Заменяет только новые разделы (присутствующие в промежуточной таблице) в целевой таблице.

<br />

Этот подход имеет следующие преимущества:

* Он быстрее, чем стратегия по умолчанию, потому что не копирует всю таблицу.
* Он безопаснее, чем другие стратегии, потому что не изменяет оригинальную таблицу, пока операция INSERT не завершится успешно: в случае промежуточной ошибки оригинальная таблица не модифицируется.
* Он реализует "неизменяемость разделов" как лучшую практику в области инженерии данных. Что упрощает инкрементную и параллельную обработку данных, откаты и т.д.

<Image img={dbt_07} size="lg" alt="инкрементное замещение вставки" />

## Создание снимка {#creating-a-snapshot}

Снимки dbt позволяют зафиксировать изменения в изменяемой модели со временем. Это, в свою очередь, позволяет выполнять запросы по состоянию модели в определенный момент времени, когда аналитики могут "посмотреть назад во времени" на предыдущее состояние модели. Это достигается с помощью [типов 2 медленно изменяющихся измерений](https://en.wikipedia.org/wiki/Slowly_changing_dimension#Type_2:_add_new_row), где столбцы from и to записывают, когда строка была действительной. Эта функциональность поддерживается плагином ClickHouse и показана ниже.

Этот пример предполагает, что вы завершили [Создание инкрементной модели таблицы](#creating-an-incremental-materialization). Убедитесь, что ваш actor_summary.sql не устанавливает inserts_only=True. Ваши models/actor_summary.sql должны выглядеть следующим образом:

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

   -- этот фильтр будет применяться только при инкрементном запуске
   where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})

   {% endif %}
   ```

1. Создайте файл `actor_summary` в директории snapshots.

    ```bash
     touch snapshots/actor_summary.sql
    ```

2. Обновите содержимое файла actor_summary.sql следующими данными:
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
* Запрос select определяет результаты, которые вы хотите зафиксировать с течением времени. Функция ref используется для ссылки на созданную ранее модель actor_summary.
* Нам требуется столбец временной метки, чтобы обозначить изменения записей. Наш столбец updated_at (смотрите [Создание инкрементной модели таблицы](#creating-an-incremental-materialization)) может быть использован здесь. Параметр strategy указывает на использование временной метки для обозначения обновлений, а параметр updated_at указывает на столбец, который использовать. Если этого нет в вашей модели, вы можете использовать [стратегию проверки](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy). Это значительно менее эффективно и требует от пользователя указания списка столбцов для сравнения. dbt сравнивает текущие и исторические значения этих столбцов, фиксируя любые изменения (или ничего не делает, если они идентичны).

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

Обратите внимание, что была создана таблица actor_summary_snapshot в базе данных snapshots (определяемой параметром target_schema).

4. При выборке этих данных вы увидите, что dbt добавил столбцы dbt_valid_from и dbt_valid_to. Последний имеет значения, установленные в null. Последующие запуски обновят это.

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

5. Пусть наш любимый актер Clicky McClickHouse появится еще в 10 фильмах.

    ```sql
    INSERT INTO imdb.roles
    SELECT now() as created_at, 845466 as actor_id, rand(number) % 412320 as movie_id, 'Himself' as role
    FROM system.numbers
    LIMIT 10;
    ```

6. Повторите команду dbt run из директории `imdb`. Это обновит инкрементную модель. После завершения запустите dbt snapshot, чтобы зафиксировать изменения.

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

7. Если теперь мы выполним запрос к нашему снимку, мы увидим, что у Clicky McClickHouse теперь 2 строки. Наша предыдущая запись теперь имеет значение dbt_valid_to. Наше новое значение записано с тем же значением в столбце dbt_valid_from и значением dbt_valid_to, установленным в null. Если бы у нас были новые строки, они также были бы добавлены в снимок.

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
```
## Использование семян {#using-seeds}

dbt предоставляет возможность загружать данные из CSV файлов. Эта функция не подходит для загрузки больших экспортов из базы данных и больше предназначена для небольших файлов, которые обычно используются для кодовых таблиц и [словарей](../../../../sql-reference/dictionaries/index.md), например, для сопоставления кодов стран с названиями стран. В качестве простого примера мы генерируем и затем загружаем список кодов жанров, используя функциональность семян.

1. Мы генерируем список кодов жанров на основе нашего существующего набора данных. Из директории dbt используйте `clickhouse-client`, чтобы создать файл `seeds/genre_codes.csv`:

    ```bash
    clickhouse-user@clickhouse:~/imdb$ clickhouse-client --password <password> --query
    "SELECT genre, ucase(substring(genre, 1, 3)) as code FROM imdb.genres GROUP BY genre
    LIMIT 100 FORMAT CSVWithNames" > seeds/genre_codes.csv
    ```

2. Выполните команду `dbt seed`. Это создаст новую таблицу `genre_codes` в нашей базе данных `imdb_dbt` (как определено в нашей конфигурации схемы) с записями из нашего CSV-файла.

    ```bash
    clickhouse-user@clickhouse:~/imdb$ dbt seed
    17:03:23  Запуск с dbt=1.1.0
    17:03:23  Найдено 1 модель, 0 тестов, 1 снапшот, 0 анализов, 181 макрос, 0 операций, 1 файл семян, 6 источников, 0 экспозиций, 0 метрик
    17:03:23
    17:03:24  Параллельно: 1 поток (target='dev')
    17:03:24
    17:03:24  1 из 1 НАЧАТЬ файл семян imdb_dbt.genre_codes..................................... [RUN]
    17:03:24  1 из 1 ОК загружен файл семян imdb_dbt.genre_codes................................. [INSERT 21 за 0.65s]
    17:03:24
    17:03:24  Завершение выполнения 1 семени за 1.62s.
    17:03:24
    17:03:24  Успешно завершено
    17:03:24
    17:03:24  Готово. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
    ```

3. Подтвердите, что они были загружены:

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
    +-------+----+
    ```

## Ограничения {#limitations}

Текущий плагин ClickHouse для dbt имеет несколько ограничений, о которых пользователи должны быть осведомлены:

1. Плагин в настоящее время материализует модели как таблицы с использованием `INSERT TO SELECT`. Это эффективно означает дублирование данных. Очень большие наборы данных (PB) могут приводить к чрезвычайно длительному времени выполнения, что делает некоторые модели неприемлемыми. Стремитесь минимизировать количество строк, возвращаемых любым запросом, используя GROUP BY, где это возможно. Предпочитайте модели, которые суммируют данные, вместо тех, которые просто выполняют преобразование, сохраняя количество строк исходных данных.
2. Чтобы использовать Распределенные таблицы для представления модели, пользователи должны вручную создать основную реплицируемую таблицу на каждом узле. Распределенная таблица, в свою очередь, может быть создана на основе этих таблиц. Плагин не управляет созданием кластера.
3. Когда dbt создает отношение (таблицу/представление) в базе данных, он обычно создает его в виде: `{{ database }}.{{ schema }}.{{ table/view id }}`. ClickHouse не имеет понятия о схемах. Поэтому плагин использует `{{schema}}.{{ table/view id }}`, где `schema` – это база данных ClickHouse.

Дополнительная информация

Предыдущие руководства лишь затрагивают основные функции dbt. Пользователям рекомендуется ознакомиться с отличной [документацией dbt](https://docs.getdbt.com/docs/introduction).

Дополнительная конфигурация для плагина описана [здесь](https://github.com/silentsokolov/dbt-clickhouse#model-configuration).

## Fivetran {#fivetran}

Коннектор `dbt-clickhouse` также доступен для использования в [преобразованиях Fivetran](https://fivetran.com/docs/transformations/dbt), что позволяет бесшовную интеграцию и возможности трансформации непосредственно в платформе Fivetran с использованием `dbt`.

## Связанный контент {#related-content}

- Блог и вебинар: [ClickHouse и dbt - Подарок от сообщества](https://clickhouse.com/blog/clickhouse-dbt-project-introduction-and-webinar)
