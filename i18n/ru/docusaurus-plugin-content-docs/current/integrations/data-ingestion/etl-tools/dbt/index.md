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

**dbt** (инструмент построения данных) позволяет аналитическим инженерам преобразовывать данные в своих хранилищах, просто написав операторы select. dbt обрабатывает материализацию этих операторов select в объекты в базе данных в виде таблиц и представлений, выполняя T в [Extract Load and Transform (ELT)](https://en.wikipedia.org/wiki/Extract,_load,_transform). Пользователи могут создавать модель, определенную оператором SELECT.

Внутри dbt эти модели могут перекрестно ссылаться и структурироваться, позволяя строить более высокоуровневые концепты. Шаблонный SQL, необходимый для подключения моделей, создается автоматически. Более того, dbt идентифицирует зависимости между моделями и обеспечивает их создание в соответствующем порядке с помощью направленного ациклического графа (DAG).

Dbt совместим с ClickHouse через [поддерживаемый ClickHouse плагин](https://github.com/ClickHouse/dbt-clickhouse). Мы описываем процесс подключения ClickHouse с простым примером на основе общедоступного набора данных IMDB. Мы дополнительно выделяем некоторые ограничения текущего коннектора.

<TOCInline toc={toc}  maxHeadingLevel={2} />
## Концепции {#concepts}

dbt вводит концепцию модели. Она определяется как оператор SQL, потенциально объединяющий множество таблиц. Модель может быть "материализована" различными способами. Материализация представляет стратегию сборки для запроса select модели. Код, стоящий за материализацией, является шаблонным SQL, который оборачивает ваш оператор SELECT в оператор для создания новой или обновления существующей связи.

dbt предоставляет 4 типа материализации:

* **view** (по умолчанию): Модель строится как представление в базе данных.
* **table**: Модель строится как таблица в базе данных.
* **ephemeral**: Модель не строится непосредственно в базе данных, а вместо этого включается в зависимые модели в виде общих табличных выражений.
* **incremental**: Модель изначально материализуется как таблица, а при последующих запусках dbt вставляет новые строки и обновляет измененные строки в таблице.

Дополнительный синтаксис и условия определяют, как эти модели должны обновляться, если изменяются их исходные данные. dbt обычно рекомендует начинать с материализации представления, пока производительность не станет проблемой. Материализация таблицы обеспечивает повышение производительности при выполнении запросов, захватывая результаты запроса модели в виде таблицы за счет увеличения памяти. Инкрементальный подход строится на этом дальше, позволяя последующим обновлениям исходных данных захватываться в целевой таблице.

[Текущий плагин](https://github.com/silentsokolov/dbt-clickhouse) для ClickHouse поддерживает **view**, **table**, **ephemeral** и **incremental** материализации. Плагин также поддерживает dbt [snapshots](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy) и [seeds](https://docs.getdbt.com/docs/building-a-dbt-project/seeds), которые мы рассмотрим в этом руководстве.

В следующих руководствах мы предполагаем, что у вас есть доступ к экземпляру ClickHouse.
## Установка dbt и плагина ClickHouse {#setup-of-dbt-and-the-clickhouse-plugin}
### dbt {#dbt}

Мы предполагаем использование CLI dbt для следующих примеров. Пользователи также могут рассмотреть [dbt Cloud](https://docs.getdbt.com/docs/dbt-cloud/cloud-overview), который предлагает веб-ориентированную интегрированную среду разработки (IDE), позволяющую пользователям редактировать и запускать проекты.

dbt предлагает несколько вариантов установки CLI. Следуйте инструкциям, описанным [здесь](https://docs.getdbt.com/dbt-cli/install/overview). На этом этапе установите только dbt-core. Мы рекомендуем использовать `pip`.

```bash
pip install dbt-core
```

**Важно: Следующее тестировалось с python 3.9.**
### Плагин ClickHouse {#clickhouse-plugin}

Установите плагин dbt ClickHouse:

```bash
pip install dbt-clickhouse
```
### Подготовка ClickHouse {#prepare-clickhouse}

dbt прекрасно справляется с моделированием высоко реляционных данных. Для примера мы предоставляем маленький набор данных IMDB со следующей реляционной схемой. Этот набор данных происходит из [репозитория реляционных наборов данных](https://relational.fit.cvut.cz/dataset/IMDb). Это несложно по сравнению с общими схемами, используемыми с dbt, но представляет собой управляемую выборку:

<Image img={dbt_01} size="lg" alt="Схема таблиц IMDB" />

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
Столбец `created_at` для таблицы `roles`, который по умолчанию имеет значение `now()`. Мы используем это позже, чтобы идентифицировать инкрементальные обновления к нашим моделям - см. [Инкрементальные модели](#creating-an-incremental-materialization).
:::

Мы используем функцию `s3`, чтобы читать исходные данные из общедоступных конечных точек для вставки данных. Выполните следующие команды, чтобы заполнить таблицы:

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

Выполнение этих команд может варьироваться в зависимости от вашей пропускной способности, но каждая должна занять всего несколько секунд для завершения. Выполните следующий запрос, чтобы вычислить сводку по каждому актеру, упорядоченную по количеству появлений в фильмах, и подтвердить, что данные были успешно загружены:

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

В последующих руководствах мы преобразуем этот запрос в модель - материализуем его в ClickHouse как представление и таблицу dbt.
## Подключение к ClickHouse {#connecting-to-clickhouse}

1. Создайте проект dbt. В данном случае мы назовем его в честь нашего источника `imdb`. Когда будет предложено, выберите `clickhouse` в качестве источника базы данных.

    ```bash
    clickhouse-user@clickhouse:~$ dbt init imdb

    16:52:40  Running with dbt=1.1.0
    Какую базу данных вы хотите использовать?
    [1] clickhouse

    (Не видите нужный? https://docs.getdbt.com/docs/available-adapters)

    Введите номер: 1
    16:53:21  Для clickhouse не найдено образца профиля.
    16:53:21
    Ваш новый проект dbt "imdb" был создан!

    Для получения дополнительной информации о настройке файла profiles.yml,
    пожалуйста, обратитесь к документации dbt здесь:

    https://docs.getdbt.com/docs/configure-your-profile
    ```

2. `cd` в папку вашего проекта:

    ```bash
    cd imdb
    ```

3. На этом этапе вам понадобится текстовый редактор по вашему выбору. В нижеследующих примерах мы используем популярный VS Code. Открывая директорию IMDB, вы должны увидеть набор файлов yml и sql:

    <Image img={dbt_02} size="lg" alt="Новый проект dbt" />

4. Обновите ваш файл `dbt_project.yml`, чтобы указать нашу первую модель - `actor_summary` и установить профиль на `clickhouse_imdb`.

    <Image img={dbt_03} size="lg" alt="профиль dbt" />

    <Image img={dbt_04} size="lg" alt="профиль dbt" />

5. Далее нам нужно предоставить dbt сведения о подключении к нашему экземпляру ClickHouse. Добавьте следующее в ваш `~/.dbt/profiles.yml`.

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

    Обратите внимание, что необходимо изменить пользователя и пароль. Есть дополнительные доступные параметры, задокументированные [здесь](https://github.com/silentsokolov/dbt-clickhouse#example-profile).

6. Из директории IMDB выполните команду `dbt debug`, чтобы подтвердить, что dbt может подключиться к ClickHouse.

    ```bash
    clickhouse-user@clickhouse:~/imdb$ dbt debug
    17:33:53  Running with dbt=1.1.0
    версия dbt: 1.1.0
    версия python: 3.10.1
    путь python: /home/dale/.pyenv/versions/3.10.1/bin/python3.10
    информация о ОС: Linux-5.13.0-10039-tuxedo-x86_64-with-glibc2.31
    Используя файл profiles.yml по пути /home/dale/.dbt/profiles.yml
    Используя файл dbt_project.yml по пути /opt/dbt/imdb/dbt_project.yml

    Конфигурация:
    файл profiles.yml [ОК найден и действителен]
    файл dbt_project.yml [ОК найден и действителен]

    Требуемые зависимости:
    - git [ОК найден]

    Подключение:
    host: localhost
    port: 8123
    user: default
    schema: imdb_dbt
    secure: False
    проверка подключения: [ОК соединение установлено]

    Все проверки пройдены!
    ```

    Подтвердите, что ответ включает `проверка соединения: [ОК соединение установлено]`, что указывает на успешное соединение.
## Создание простой материализации представления {#creating-a-simple-view-materialization}

При использовании материализации представления модель перестраивается как представление при каждом запуске через оператор `CREATE VIEW AS` в ClickHouse. Это не требует дополнительного хранения данных, но будет медленнее запрашиваться, чем материализации таблицы.

1. Из папки `imdb` удалите директорию `models/example`:

    ```bash
    clickhouse-user@clickhouse:~/imdb$ rm -rf models/example
    ```

2. Создайте новый файл в папке `actors` внутри папки `models`. Здесь мы создаем файлы, которые будут представлять модель актера:

    ```bash
    clickhouse-user@clickhouse:~/imdb$ mkdir models/actors
    ```

3. Создайте файлы `schema.yml` и `actor_summary.sql` в папке `models/actors`.

    ```bash
    clickhouse-user@clickhouse:~/imdb$ touch models/actors/actor_summary.sql
    clickhouse-user@clickhouse:~/imdb$ touch models/actors/schema.yml
    ```
    Файл `schema.yml` определяет наши таблицы. Эти таблицы впоследствии будут доступны для использования в макросах.  Отредактируйте `models/actors/schema.yml`, чтобы он содержал этот контент:
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
    `actors_summary.sql` определяет нашу фактическую модель. Обратите внимание, что в функции конфигурации мы также запрашиваем, чтобы модель была материализована как представление в ClickHouse. Наши таблицы ссылаются на файл `schema.yml` через функцию `source`, например, `source('imdb', 'movies')` ссылается на таблицу `movies` в базе данных `imdb`.  Отредактируйте `models/actors/actors_summary.sql`, чтобы он содержал этот контент:
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

4. Из директории `imdb` выполните команду `dbt run`.

    ```bash
    clickhouse-user@clickhouse:~/imdb$ dbt run
    15:05:35  Running with dbt=1.1.0
    15:05:35  Найден 1 модель, 0 тестов, 1 снапшот, 0 анализов, 181 макрос, 0 операций, 0 файлов семян, 6 источников, 0 экспозиций, 0 метрик
    15:05:35
    15:05:36  Конкуренция: 1 поток (target='dev')
    15:05:36
    15:05:36  1 из 1 НАЧАЛО модель представления imdb_dbt.actor_summary.................................. [RUN]
    15:05:37  1 из 1 ОК создано модель представления imdb_dbt.actor_summary............................. [OK за 1.00с]
    15:05:37
    15:05:37  Завершение работы 1 модели представления за 1.97с.
    15:05:37
    15:05:37  Завершено успешно
    15:05:37
    15:05:37  Готово. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
    ```

5. dbt представит модель как представление в ClickHouse, как и было запрошено. Мы теперь можем напрямую запрашивать это представление. Это представление будет создано в базе данных `imdb_dbt` - это определяется параметром schema в файле `~/.dbt/profiles.yml` под профилем `clickhouse_imdb`.

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
    |imdb_dbt          |  <---создан dbt!
    |information_schema|
    |system            |
    +------------------+
    ```

    Запрашивая это представление, мы можем воспроизвести результаты нашего более раннего запроса с более простым синтаксисом:

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

В предыдущем примере наша модель была материализована как представление. Хотя это может предложить достаточную производительность для некоторых запросов, более сложные SELECT или часто выполняемые запросы могут быть лучше материализованы как таблица. Эта материализация полезна для моделей, которые будут запрашиваться инструментами BI, чтобы обеспечить пользователям более быстрый опыт. Это фактически приводит к тому, что результаты запроса хранятся как новая таблица с соответствующими накладными расходами на хранение - фактически выполняется `INSERT TO SELECT`. Обратите внимание, что эта таблица будет перестраиваться каждый раз, то есть она не является инкрементальной. Большие наборы результатов могут, следовательно, привести к длительному времени выполнения - см. [Ограничения dbt](#limitations).

1. Измените файл `actors_summary.sql` так, чтобы параметр `materialized` был установлен на `table`. Обратите внимание, как определен `ORDER BY`, и обратите внимание, что мы используем движок таблицы `MergeTree`:

    ```sql
    {{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='table') }}
    ```

2. Из директории `imdb` выполните команду `dbt run`. Это выполнение может занять немного больше времени - около 10 секунд на большинстве машин.

    ```bash
    clickhouse-user@clickhouse:~/imdb$ dbt run
    15:13:27  Running with dbt=1.1.0
    15:13:27  Найден 1 модель, 0 тестов, 1 снапшот, 0 анализов, 181 макрос, 0 операций, 0 файлов семян, 6 источников, 0 экспозиций, 0 метрик
    15:13:27
    15:13:28  Конкуренция: 1 поток (target='dev')
    15:13:28
    15:13:28  1 из 1 НАЧАЛО модель таблицы imdb_dbt.actor_summary................................. [RUN]
    15:13:37  1 из 1 ОК создана модель таблицы imdb_dbt.actor_summary............................ [OK за 9.22с]
    15:13:37
    15:13:37  Завершение работы 1 модели таблицы за 10.20с.
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

4. Подтвердите, что результаты из этой таблицы совпадают с предыдущими ответами. Обратите внимание на очевидное улучшение времени ответа теперь, когда модель является таблицей:

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

    Не стесняйтесь выполнять другие запросы к этой модели. Например, какие актеры имеют самые высокие рейтинговые фильмы с более чем 5 появлениями?

    ```sql
    SELECT * FROM imdb_dbt.actor_summary WHERE num_movies > 5 ORDER BY avg_rank  DESC LIMIT 10;
    ```
## Создание инкрементного материализованного представления {#creating-an-incremental-materialization}

В предыдущем примере была создана таблица для материализации модели. Эта таблица будет перестраиваться при каждом выполнении dbt. Это может быть непрактично и очень затратно для больших наборов данных или сложных преобразований. Чтобы решить эту проблему и сократить время сборки, dbt предлагает инкрементные материализации. Это позволяет dbt вставлять или обновлять записи в таблице с момента последнего выполнения, что делает это подходящим для данных в стиле событий. Внутри создается временная таблица с обновленными записями, после чего все незатронутые записи, а также обновленные записи вставляются в новую целевую таблицу. Это приводит к аналогичным [ограничениям](#limitations) для больших наборов данных, как и для табличной модели.

Чтобы преодолеть эти ограничения для больших наборов, плагин поддерживает режим 'inserts_only', при котором все обновления вставляются непосредственно в целевую таблицу без создания временной таблицы (подробнее об этом ниже).

Чтобы проиллюстрировать этот пример, мы добавим актера "Clicky McClickHouse", который появится в невероятных 910 фильмах, убедившись, что он появился в большем количестве фильмов, чем даже [Мел Бланк](https://en.wikipedia.org/wiki/Mel_Blanc).

1. Сначала мы модифицируем нашу модель, чтобы она была инкрементного типа. Это дополнение требует:

    1. **unique_key** - Чтобы обеспечить уникальную идентификацию строк, мы должны предоставить unique_key - в данном случае, поле `id` из нашего запроса будет достаточно. Это гарантирует, что у нас не будет дубликатов строк в нашей материализованной таблице. Для получения дополнительной информации об ограничениях уникальности см. [здесь](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#defining-a-uniqueness-constraint-optional).
    2. **Инкрементальный фильтр** - Нам также нужно сказать dbt, как он должен выявлять, какие строки изменились за инкрементный запуск. Это достигается путем предоставления выражения дельты. Обычно это включает временную метку для событийных данных; следовательно, наше поле метки времени updated_at. Этот столбец, который по умолчанию принимает значение now() при вставке строк, позволяет идентифицировать новые роли. Кроме того, нам нужно определить альтернативный случай, когда добавляются новые актеры. Используя переменную `{{this}}`, для обозначения существующей материализованной таблицы, мы получаем выражение `where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})`. Мы встраиваем это внутрь условия `{% if is_incremental() %}`, обеспечивая его использование только для инкрементных запусков, а не при первом создании таблицы. Для получения дополнительной информации о фильтрации строк для инкрементных моделей см. [это обсуждение в документации dbt](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#filtering-rows-on-an-incremental-run).

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

    Обратите внимание, что наша модель будет реагировать только на обновления и добавления к таблицам `roles` и `actors`. Чтобы реагировать на все таблицы, пользователям рекомендуется разделить эту модель на несколько подмоделей — каждая из которых будет иметь свои собственные инкрементные критерии. Эти модели могут в свою очередь быть использованы как ссылки и связываться. Для получения дополнительных сведений о перекрестных ссылках моделей см. [здесь](https://docs.getdbt.com/reference/dbt-jinja-functions/ref).

2. Выполните команду `dbt run` и подтвердите результаты результирующей таблицы:

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

4. Пусть "Clicky" сыграет в 910 случайных фильмах:

    ```sql
    INSERT INTO imdb.roles
    SELECT now() as created_at, 845466 as actor_id, id as movie_id, 'Himself' as role
    FROM imdb.movies
    LIMIT 910 OFFSET 10000;
    ```

5. Подтвердите, что он действительно теперь актер с наибольшим количеством появлений, выполнив запрос к исходной таблице и обойдя любые модели dbt:

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

6. Выполните команду `dbt run` и подтвердите, что наша модель была обновлена и соответствует вышеуказанным результатам:

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

Мы можем определить выполняемые операторы для выполнения вышеуказанного инкрементного обновления, выполнив запрос к журналу запросов ClickHouse.

```sql
SELECT event_time, query  FROM system.query_log WHERE type='QueryStart' AND query LIKE '%dbt%'
AND event_time > subtractMinutes(now(), 15) ORDER BY event_time LIMIT 100;
```

Отрегулируйте вышеуказанный запрос на период выполнения. Мы оставляем проверку результатов пользователю, но подчеркиваем общую стратегию, используемую плагином для выполнения инкрементных обновлений:

1. Плагин создает временную таблицу `actor_sumary__dbt_tmp`. Измененные строки передаются в эту таблицу.
2. Создается новая таблица `actor_summary_new`. Строки из старой таблицы, в свою очередь, передаются из старой в новую с проверкой, чтобы удостовериться, что идентификаторы строк не существуют во временной таблице. Это эффективно обрабатывает обновления и дубликаты.
3. Результаты из временной таблицы передаются в новую таблицу `actor_summary`.
4. Наконец, новая таблица атомарно заменяется старой версией с помощью оператора `EXCHANGE TABLES`. Старая и временные таблицы, в свою очередь, удаляются.

Это визуализировано ниже:

<Image img={dbt_05} size="lg" alt="инкрементные обновления dbt" />

Эта стратегия может столкнуться с проблемами на очень больших моделях. Для получения дополнительной информации см. [Ограничения](#limitations).

### Стратегия добавления (режим inserts-only) {#append-strategy-inserts-only-mode}

Чтобы преодолеть ограничения больших наборов данных в инкрементных моделях, плагин использует параметр конфигурации dbt `incremental_strategy`. Этот параметр может быть установлен в значение `append`. При этом обновленные строки вставляются непосредственно в целевую таблицу (также известную как `imdb_dbt.actor_summary`), и временная таблица не создается.
Примечание: режим только добавления требует, чтобы ваши данные были неизменяемыми или чтобы дубликаты были приемлемы. Если вам нужна инкрементная табличная модель, поддерживающая измененные строки, не используйте этот режим!

Чтобы проиллюстрировать этот режим, мы добавим еще одного нового актера и повторно выполним dbt run с `incremental_strategy='append'`.

1. Настройте режим только добавления в actor_summary.sql:

   ```sql
   {{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='append') }}
   ```

2. Давайте добавим еще одного известного актера - Дэнни ДеВито.

   ```sql
   INSERT INTO imdb.actors VALUES (845467, 'Danny', 'DeBito', 'M');
   ```

3. Пусть Дэнни сыграет в 920 случайных фильмах.

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

Обратите внимание, как быстро прошло это инкрементное обновление по сравнению с добавлением "Clicky".

Повторная проверка таблицы query_log показывает различия между двумя инкрементными запусками:

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

В этом запуске только новые строки добавляются непосредственно в таблицу `imdb_dbt.actor_summary`, и создание таблицы не подразумевается.

### Режим Delete+Insert (Экспериментальный) {#deleteinsert-mode-experimental}

Исторически ClickHouse имел только ограниченную поддержку обновлений и удалений в форме асинхронных [мутаций](/sql-reference/statements/alter/index.md). Эти мутации могут быть крайне интенсивными по вводу-выведению и их обычно следует избегать.

ClickHouse 22.8 ввел [легковесные удаления](/sql-reference/statements/delete.md). Эти операции в настоящее время являются экспериментальными, но предлагают более производительный способ удаления данных.

Этот режим можно настроить для модели через параметр `incremental_strategy`, т.е.

```sql
{{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='delete+insert') }}
```

Эта стратегия непосредственно воздействует на таблицу целевой модели, поэтому если возникает проблема во время операции, данные в инкрементной модели, вероятно, окажутся в недействительном состоянии - атомарного обновления не происходит.

Вкратце, этот подход:

1. Плагин создает временную таблицу `actor_sumary__dbt_tmp`. Строки, которые изменились, передаются в эту таблицу.
2. Осуществляется `DELETE` в текущую таблицу `actor_summary`. Строки удаляются по идентификатору из `actor_sumary__dbt_tmp`.
3. Строки из `actor_sumary__dbt_tmp` вставляются в `actor_summary` с использованием команды `INSERT INTO actor_summary SELECT * FROM actor_sumary__dbt_tmp`.

Этот процесс показан ниже:

<Image img={dbt_06} size="lg" alt="легковесное удаление инкрементное" />

### Режим insert_overwrite (Экспериментальный) {#insert_overwrite-mode-experimental}

Выполняет следующие шаги:

1. Создает временную (стейджинговую) таблицу с такой же структурой, как у инкрементной модели: `CREATE TABLE {staging} AS {target}`.
2. Вставляет только новые записи (полученные с помощью SELECT) в стейджинговую таблицу.
3. Заменяет только новые партиции (присутствующие в стейджинговой таблице) в целевой таблице.

<br />

Этот подход имеет следующие преимущества:

* Он быстрее, чем стратегия по умолчанию, потому что не копирует всю таблицу.
* Он безопаснее других стратегий, потому что не модифицирует оригинальную таблицу, пока операция INSERT не завершится успешно: в случае промежуточного сбоя оригинальная таблица не изменяется.
* Он реализует "неизменяемость партиций", что является лучшей практикой в области обработки данных. Это упрощает инкрементную и параллельную обработку данных, откаты и т.д.

<Image img={dbt_07} size="lg" alt="перезапись инкрементная" />

## Создание снимка {#creating-a-snapshot}

Снимки dbt позволяют зафиксировать изменения в изменяемой модели со временем. Это, в свою очередь, позволяет выполнять запросы на определенную дату к моделям, где аналитики могут "оглянуться назад во времени" на предыдущее состояние модели. Это достигается с использованием [измерений, меняющихся медленно типа 2](https://en.wikipedia.org/wiki/Slowly_changing_dimension#Type_2:_add_new_row), где столбцы "с" и "по" фиксируют, когда строка была действительна. Эта функциональность поддерживается плагином ClickHouse и демонстрируется ниже.

Этот пример предполагает, что вы завершили [Создание инкрементной табличной модели](#creating-an-incremental-materialization). Убедитесь, что ваш actor_summary.sql не устанавливает inserts_only=True. Ваши models/actor_summary.sql должны выглядеть так:

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

Несколько замечаний относительно этого содержимого:
* Запрос select определяет результаты, которые вы хотите фиксировать со временем. Функция ref используется для ссылки на нашу ранее созданную модель actor_summary.
* Мы требуем столбец временной метки, чтобы указать изменения записей. Наш столбец updated_at (см. [Создание инкрементной табличной модели](#creating-an-incremental-materialization)) может быть использован здесь. Параметр strategy указывает на использование временной метки для обозначения обновлений, с параметром updated_at, указывающим, какой столбец использовать. Если этого столбца нет в вашей модели, вы можете в качестве альтернативы использовать [стратегию проверки](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy). Это значительно менее эффективно и требует от пользователя указать список столбцов для сравнения. dbt сравнивает текущие и исторические значения этих столбцов, фиксируя любые изменения (или ничего не делая, если они идентичны).

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

Обратите внимание, что в базе данных snapshots была создана таблица actor_summary_snapshot (определяется параметром target_schema).

4. Делая выборку этих данных, вы увидите, что dbt включил столбцы dbt_valid_from и dbt_valid_to. Последний имеет значения, установленные в null. Последующие запуски будут обновлять это.

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

5. Сделаем нашего любимого актера Clicky McClickHouse появиться еще в 10 фильмах.

    ```sql
    INSERT INTO imdb.roles
    SELECT now() as created_at, 845466 as actor_id, rand(number) % 412320 as movie_id, 'Himself' as role
    FROM system.numbers
    LIMIT 10;
    ```

6. Повторно выполните команду dbt run из директории `imdb`. Это обновит инкрементную модель. После завершения запустите команду dbt snapshot, чтобы зафиксировать изменения.

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

7. Если мы теперь выполним запрос к нашему снимку, обратите внимание, что у Clicky McClickHouse теперь две строки. Наша предыдущая запись теперь имеет значение dbt_valid_to. Новое значение записывается с тем же значением в столбце dbt_valid_from и значением dbt_valid_to равным null. Если у нас будут новые строки, они также будут добавлены в снимок.

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

Для получения дополнительной информации о снимках dbt см. [здесь](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots).
```yaml
title: 'Использование семян'
sidebar_label: 'Использование семян'
keywords: ['dbt', 'семена', 'CSV', 'ClickHouse']
description: 'В этом разделе рассматривается, как использовать семена для загрузки данных в ClickHouse с помощью dbt.'
```

## Использование семян {#using-seeds}

dbt предоставляет возможность загружать данные из файлов CSV. Эта возможность не подходит для загрузки больших экспортов базы данных и предназначена больше для небольших файлов, которые обычно используются для кодовых таблиц и [словарей](../../../../sql-reference/dictionaries/index.md), например, сопоставления кодов стран с названиями стран. В качестве простого примера мы генерируем список кодов жанров и загружаем его, используя функциональность семян.

1. Мы генерируем список кодов жанров из нашего существующего набора данных. Из директории dbt используйте `clickhouse-client`, чтобы создать файл `seeds/genre_codes.csv`:

    ```bash
    clickhouse-user@clickhouse:~/imdb$ clickhouse-client --password <password> --query
    "SELECT genre, ucase(substring(genre, 1, 3)) as code FROM imdb.genres GROUP BY genre
    LIMIT 100 FORMAT CSVWithNames" > seeds/genre_codes.csv
    ```

2. Выполните команду `dbt seed`. Это создаст новую таблицу `genre_codes` в нашей базе данных `imdb_dbt` (как определено в конфигурации схемы) с записями из нашего файла csv.

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
    +-------+----+=
    ```

## Ограничения {#limitations}

Текущий плагин ClickHouse для dbt имеет несколько ограничений, о которых пользователи должны быть осведомлены:

1. Плагин в настоящее время материализует модели как таблицы с использованием `INSERT TO SELECT`. Это фактически означает дублирование данных. Очень большие наборы данных (PB) могут привести к чрезвычайно долгому времени выполнения, делая некоторые модели нецелесообразными. Стремитесь минимизировать количество строк, возвращаемых любым запросом, используя GROUP BY, когда это возможно. Предпочитайте модели, которые обобщают данные, по сравнению с теми, которые просто выполняют преобразование, сохраняя количество строк источника.
2. Чтобы использовать распределенные таблицы для представления модели, пользователи должны вручную создать базовые реплицируемые таблицы на каждом узле. Распределенная таблица, в свою очередь, может быть создана на основе этих таблиц. Плагин не управляет созданием кластера.
3. Когда dbt создает связь (таблицу/представление) в базе данных, он обычно создает её в формате: `{{ database }}.{{ schema }}.{{ table/view id }}`. ClickHouse не имеет представления о схемах. Следовательно, плагин использует `{{schema}}.{{ table/view id }}`, где `schema` - это база данных ClickHouse.

Дополнительная информация

Предыдущие руководства лишь касаются функциональности dbt. Пользователям рекомендуется ознакомиться с отличной [документацией dbt](https://docs.getdbt.com/docs/introduction).

Дополнительная конфигурация для плагина описана [здесь](https://github.com/silentsokolov/dbt-clickhouse#model-configuration).

## Fivetran {#fivetran}

Коннектор `dbt-clickhouse` также доступен для использования в [трансформациях Fivetran](https://fivetran.com/docs/transformations/dbt), что позволяет осуществлять бесшовную интеграцию и преобразование прямо внутри платформы Fivetran, используя `dbt`.

## Связанный контент {#related-content}

- Блог и вебинар: [ClickHouse и dbt - Подарок от сообщества](https://clickhouse.com/blog/clickhouse-dbt-project-introduction-and-webinar)
