---
slug: /materialized-view/refreshable-materialized-view
title: 'Обновляемое материализованное представление'
description: 'Как использовать обновляемые материализованные представления для ускорения запросов'
keywords: ['refreshable materialized view', 'refresh', 'materialized views', 'speed up queries', 'query optimization']
doc_type: 'guide'
---

import refreshableMaterializedViewDiagram from '@site/static/images/materialized-view/refreshable-materialized-view-diagram.png';
import Image from '@theme/IdealImage';

[Обновляемые материализованные представления](/sql-reference/statements/create/view#refreshable-materialized-view) концептуально похожи на материализованные представления в традиционных OLTP-базах данных: они хранят результат заданного запроса для быстрого доступа и уменьшают необходимость многократного выполнения ресурсоёмких запросов. В отличие от [инкрементных материализованных представлений](/materialized-view/incremental-materialized-view) в ClickHouse, здесь требуется периодическое выполнение запроса по всему набору данных — его результаты сохраняются в целевой таблице для последующей выборки. Теоретически этот результирующий набор должен быть меньше исходного набора данных, что позволяет последующим запросам выполняться быстрее.

На диаграмме показано, как работают обновляемые материализованные представления:

<Image img={refreshableMaterializedViewDiagram} size="lg" alt="Диаграмма обновляемого материализованного представления" />

Вы также можете посмотреть следующее видео:

<iframe width="560" height="315" src="https://www.youtube.com/embed/-KhFJSY8yrs?si=VPRSZb20vaYkuR_C" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />


## Когда следует использовать обновляемые материализованные представления? {#when-should-refreshable-materialized-views-be-used}

Инкрементальные материализованные представления ClickHouse чрезвычайно мощны и обычно масштабируются значительно лучше, чем подход с использованием обновляемых материализованных представлений, особенно в случаях, когда необходимо выполнить агрегацию данных одной таблицы. Благодаря вычислению агрегации только для каждого блока данных при его вставке и объединению инкрементальных состояний в итоговой таблице, запрос всегда выполняется только на подмножестве данных. Этот метод масштабируется до петабайтов данных и обычно является предпочтительным.

Однако существуют сценарии использования, где инкрементальный процесс не требуется или неприменим. Некоторые задачи либо несовместимы с инкрементальным подходом, либо не требуют обновлений в реальном времени — в таких случаях более подходящим является периодическое перестроение. Например, может потребоваться регулярно выполнять полный пересчёт представления по всему набору данных, если оно использует сложное соединение, несовместимое с инкрементальным подходом.

> Обновляемые материализованные представления могут выполнять пакетные процессы, такие как денормализация. Между обновляемыми материализованными представлениями можно создавать зависимости таким образом, чтобы одно представление зависело от результатов другого и выполнялось только после его завершения. Это может заменить запланированные рабочие процессы или простые направленные ациклические графы (DAG), такие как задание [dbt](https://www.getdbt.com/). Чтобы узнать больше о настройке зависимостей между обновляемыми материализованными представлениями, перейдите в раздел `Dependencies` документации [CREATE VIEW](/sql-reference/statements/create/view#refresh-dependencies).


## Как обновить обновляемое материализованное представление? {#how-do-you-refresh-a-refreshable-materialized-view}

Обновляемые материализованные представления обновляются автоматически с интервалом, заданным при создании.
Например, следующее материализованное представление обновляется каждую минуту:

```sql
CREATE MATERIALIZED VIEW table_name_mv
REFRESH EVERY 1 MINUTE TO table_name AS
...
```

Чтобы принудительно обновить материализованное представление, используйте команду `SYSTEM REFRESH VIEW`:

```sql
SYSTEM REFRESH VIEW table_name_mv;
```

Также можно отменить, остановить или запустить представление.
Подробнее см. в документации по [управлению обновляемыми материализованными представлениями](/sql-reference/statements/system#refreshable-materialized-views).


## Когда обновляемое материализованное представление было обновлено в последний раз? {#when-was-a-refreshable-materialized-view-last-refreshed}

Чтобы узнать, когда обновляемое материализованное представление было обновлено в последний раз, выполните запрос к системной таблице [`system.view_refreshes`](/operations/system-tables/view_refreshes), как показано ниже:

```sql
SELECT database, view, status,
       last_success_time, last_refresh_time, next_refresh_time,
       read_rows, written_rows
FROM system.view_refreshes;
```

```text
┌─database─┬─view─────────────┬─status────┬───last_success_time─┬───last_refresh_time─┬───next_refresh_time─┬─read_rows─┬─written_rows─┐
│ database │ table_name_mv    │ Scheduled │ 2024-11-11 12:10:00 │ 2024-11-11 12:10:00 │ 2024-11-11 12:11:00 │   5491132 │       817718 │
└──────────┴──────────────────┴───────────┴─────────────────────┴─────────────────────┴─────────────────────┴───────────┴──────────────┘
```


## Как изменить частоту обновления? {#how-can-i-change-the-refresh-rate}

Чтобы изменить частоту обновления обновляемого материализованного представления, используйте синтаксис [`ALTER TABLE...MODIFY REFRESH`](/sql-reference/statements/alter/view#alter-table--modify-refresh-statement).

```sql
ALTER TABLE table_name_mv
MODIFY REFRESH EVERY 30 SECONDS;
```

После этого вы можете использовать запрос [When was a refreshable materialized view last refreshed?](/materialized-view/refreshable-materialized-view#when-was-a-refreshable-materialized-view-last-refreshed), чтобы убедиться, что частота была обновлена:

```text
┌─database─┬─view─────────────┬─status────┬───last_success_time─┬───last_refresh_time─┬───next_refresh_time─┬─read_rows─┬─written_rows─┐
│ database │ table_name_mv    │ Scheduled │ 2024-11-11 12:22:30 │ 2024-11-11 12:22:30 │ 2024-11-11 12:23:00 │   5491132 │       817718 │
└──────────┴──────────────────┴───────────┴─────────────────────┴─────────────────────┴─────────────────────┴───────────┴──────────────┘
```


## Использование `APPEND` для добавления новых строк {#using-append-to-add-new-rows}

Функциональность `APPEND` позволяет добавлять новые строки в конец таблицы вместо замены всего представления.

Одно из применений этой функции — создание снимков значений в определённый момент времени. Например, представим, что у нас есть таблица `events`, заполняемая потоком сообщений из [Kafka](https://kafka.apache.org/), [Redpanda](https://www.redpanda.com/) или другой платформы потоковой передачи данных.

```sql
SELECT *
FROM events
LIMIT 10

Query id: 7662bc39-aaf9-42bd-b6c7-bc94f2881036

┌──────────────────ts─┬─uuid─┬─count─┐
│ 2008-08-06 17:07:19 │ 0eb  │   547 │
│ 2008-08-06 17:07:19 │ 60b  │   148 │
│ 2008-08-06 17:07:19 │ 106  │   750 │
│ 2008-08-06 17:07:19 │ 398  │   875 │
│ 2008-08-06 17:07:19 │ ca0  │   318 │
│ 2008-08-06 17:07:19 │ 6ba  │   105 │
│ 2008-08-06 17:07:19 │ df9  │   422 │
│ 2008-08-06 17:07:19 │ a71  │   991 │
│ 2008-08-06 17:07:19 │ 3a2  │   495 │
│ 2008-08-06 17:07:19 │ 598  │   238 │
└─────────────────────┴──────┴───────┘
```

В этом наборе данных содержится `4096` значений в столбце `uuid`. Мы можем написать следующий запрос, чтобы найти значения с наибольшим суммарным count:

```sql
SELECT
    uuid,
    sum(count) AS count
FROM events
GROUP BY ALL
ORDER BY count DESC
LIMIT 10

┌─uuid─┬───count─┐
│ c6f  │ 5676468 │
│ 951  │ 5669731 │
│ 6a6  │ 5664552 │
│ b06  │ 5662036 │
│ 0ca  │ 5658580 │
│ 2cd  │ 5657182 │
│ 32a  │ 5656475 │
│ ffe  │ 5653952 │
│ f33  │ 5653783 │
│ c5b  │ 5649936 │
└──────┴─────────┘
```

Предположим, мы хотим фиксировать значение count для каждого `uuid` каждые 10 секунд и сохранять его в новой таблице `events_snapshot`. Схема таблицы `events_snapshot` будет выглядеть следующим образом:

```sql
CREATE TABLE events_snapshot (
    ts DateTime32,
    uuid String,
    count UInt64
)
ENGINE = MergeTree
ORDER BY uuid;
```

Затем мы можем создать обновляемое материализованное представление для заполнения этой таблицы:

```sql
CREATE MATERIALIZED VIEW events_snapshot_mv
REFRESH EVERY 10 SECOND APPEND TO events_snapshot
AS SELECT
    now() AS ts,
    uuid,
    sum(count) AS count
FROM events
GROUP BY ALL;
```

После этого мы можем запросить таблицу `events_snapshot`, чтобы получить изменение count во времени для конкретного `uuid`:

```sql
SELECT *
FROM events_snapshot
WHERE uuid = 'fff'
ORDER BY ts ASC
FORMAT PrettyCompactMonoBlock

```


┌──────────────────ts─┬─uuid─┬───count─┐
│ 2024-10-01 16:12:56 │ fff  │ 5424711 │
│ 2024-10-01 16:13:00 │ fff  │ 5424711 │
│ 2024-10-01 16:13:10 │ fff  │ 5424711 │
│ 2024-10-01 16:13:20 │ fff  │ 5424711 │
│ 2024-10-01 16:13:30 │ fff  │ 5674669 │
│ 2024-10-01 16:13:40 │ fff  │ 5947912 │
│ 2024-10-01 16:13:50 │ fff  │ 6203361 │
│ 2024-10-01 16:14:00 │ fff  │ 6501695 │
└─────────────────────┴──────┴─────────┘

```
```


## Примеры {#examples}

Теперь рассмотрим, как использовать обновляемые материализованные представления на примере нескольких наборов данных.

### Stack Overflow {#stack-overflow}

[Руководство по денормализации данных](/data-modeling/denormalization) демонстрирует различные техники денормализации данных с использованием набора данных Stack Overflow. Мы заполняем данными следующие таблицы: `votes`, `users`, `badges`, `posts` и `postlinks`.

В этом руководстве мы показали, как денормализовать набор данных `postlinks` в таблицу `posts` с помощью следующего запроса:

```sql
SELECT
    posts.*,
    arrayMap(p -> (p.1, p.2), arrayFilter(p -> p.3 = 'Linked' AND p.2 != 0, Related)) AS LinkedPosts,
    arrayMap(p -> (p.1, p.2), arrayFilter(p -> p.3 = 'Duplicate' AND p.2 != 0, Related)) AS DuplicatePosts
FROM posts
LEFT JOIN (
    SELECT
         PostId,
         groupArray((CreationDate, RelatedPostId, LinkTypeId)) AS Related
    FROM postlinks
    GROUP BY PostId
) AS postlinks ON posts_types_codecs_ordered.Id = postlinks.PostId;
```

Затем мы показали, как выполнить однократную вставку этих данных в таблицу `posts_with_links`, но в производственной системе эту операцию необходимо выполнять периодически.

Обе таблицы `posts` и `postlinks` потенциально могут обновляться. Поэтому вместо попытки реализовать это объединение с использованием инкрементных материализованных представлений может быть достаточно просто запланировать выполнение этого запроса с заданным интервалом, например, раз в час, сохраняя результаты в таблицу `post_with_links`.

Именно здесь помогает обновляемое материализованное представление, которое можно создать с помощью следующего запроса:

```sql
CREATE MATERIALIZED VIEW posts_with_links_mv
REFRESH EVERY 1 HOUR TO posts_with_links AS
SELECT
    posts.*,
    arrayMap(p -> (p.1, p.2), arrayFilter(p -> p.3 = 'Linked' AND p.2 != 0, Related)) AS LinkedPosts,
    arrayMap(p -> (p.1, p.2), arrayFilter(p -> p.3 = 'Duplicate' AND p.2 != 0, Related)) AS DuplicatePosts
FROM posts
LEFT JOIN (
    SELECT
         PostId,
         groupArray((CreationDate, RelatedPostId, LinkTypeId)) AS Related
    FROM postlinks
    GROUP BY PostId
) AS postlinks ON posts_types_codecs_ordered.Id = postlinks.PostId;
```

Представление выполнится немедленно и затем каждый час в соответствии с настройками, чтобы обеспечить отражение обновлений исходной таблицы. Важно отметить, что при повторном выполнении запроса набор результатов обновляется атомарно и прозрачно.

:::note
Синтаксис здесь идентичен инкрементному материализованному представлению, за исключением того, что мы добавляем предложение [`REFRESH`](/sql-reference/statements/create/view#refreshable-materialized-view):
:::

### IMDb {#imdb}

В [руководстве по интеграции dbt и ClickHouse](/integrations/dbt) мы заполнили набор данных IMDb следующими таблицами: `actors`, `directors`, `genres`, `movie_directors`, `movies` и `roles`.

Затем можно написать следующий запрос для вычисления сводки по каждому актёру, упорядоченной по количеству появлений в фильмах.

```sql
SELECT
  id, any(actor_name) AS name, uniqExact(movie_id) AS movies,
  round(avg(rank), 2) AS avg_rank, uniqExact(genre) AS genres,
  uniqExact(director_name) AS directors, max(created_at) AS updated_at
FROM (
  SELECT
    imdb.actors.id AS id,
    concat(imdb.actors.first_name, ' ', imdb.actors.last_name) AS actor_name,
    imdb.movies.id AS movie_id, imdb.movies.rank AS rank, genre,
    concat(imdb.directors.first_name, ' ', imdb.directors.last_name) AS director_name,
    created_at
  FROM imdb.actors
  INNER JOIN imdb.roles ON imdb.roles.actor_id = imdb.actors.id
  LEFT JOIN imdb.movies ON imdb.movies.id = imdb.roles.movie_id
  LEFT JOIN imdb.genres ON imdb.genres.movie_id = imdb.movies.id
  LEFT JOIN imdb.movie_directors ON imdb.movie_directors.movie_id = imdb.movies.id
  LEFT JOIN imdb.directors ON imdb.directors.id = imdb.movie_directors.director_id
)
GROUP BY id
ORDER BY movies DESC
LIMIT 5;
```


```text
┌─────id─┬─name─────────┬─num_movies─┬───────────avg_rank─┬─unique_genres─┬─uniq_directors─┬──────────updated_at─┐
│  45332 │ Mel Blanc    │        909 │ 5.7884792542982515 │            19 │            148 │ 2024-11-11 12:01:35 │
│ 621468 │ Bess Flowers │        672 │  5.540605094212635 │            20 │            301 │ 2024-11-11 12:01:35 │
│ 283127 │ Tom London   │        549 │ 2.8057034230202023 │            18 │            208 │ 2024-11-11 12:01:35 │
│ 356804 │ Bud Osborne  │        544 │ 1.9575342420755093 │            16 │            157 │ 2024-11-11 12:01:35 │
│  41669 │ Adoor Bhasi  │        544 │                  0 │             4 │            121 │ 2024-11-11 12:01:35 │
└────────┴──────────────┴────────────┴────────────────────┴───────────────┴────────────────┴─────────────────────┘

Выбрано 5 строк. Затрачено: 0,393 сек. Обработано 5,45 млн строк, 86,82 МБ (13,87 млн строк/сек., 221,01 МБ/сек.)
Пиковое использование памяти: 1,38 ГиБ.
```

Получение результата занимает не так уж много времени, но предположим, что мы хотим сделать его ещё быстрее и менее затратным по вычислительным ресурсам.
Допустим, этот набор данных тоже постоянно обновляется — фильмы постоянно выходят, появляются новые актёры и режиссёры.

Пришло время использовать обновляемое материализованное представление, поэтому сначала создадим целевую таблицу для результатов:

```sql
CREATE TABLE imdb.actor_summary
(
        `id` UInt32,
        `name` String,
        `num_movies` UInt16,
        `avg_rank` Float32,
        `unique_genres` UInt16,
        `uniq_directors` UInt16,
        `updated_at` DateTime
)
ENGINE = MergeTree
ORDER BY num_movies
```

Теперь мы можем создать представление:

```sql
CREATE MATERIALIZED VIEW imdb.actor_summary_mv
REFRESH EVERY 1 MINUTE TO imdb.actor_summary AS
SELECT
        id,
        any(actor_name) AS name,
        uniqExact(movie_id) AS num_movies,
        avg(rank) AS avg_rank,
        uniqExact(genre) AS unique_genres,
        uniqExact(director_name) AS uniq_directors,
        max(created_at) AS updated_at
FROM
(
        SELECT
        imdb.actors.id AS id,
        concat(imdb.actors.first_name, ' ', imdb.actors.last_name) AS actor_name,
        imdb.movies.id AS movie_id,
        imdb.movies.rank AS rank,
        genre,
        concat(imdb.directors.first_name, ' ', imdb.directors.last_name) AS director_name,
        created_at
        FROM imdb.actors
    INNER JOIN imdb.roles ON imdb.roles.actor_id = imdb.actors.id
    LEFT JOIN imdb.movies ON imdb.movies.id = imdb.roles.movie_id
    LEFT JOIN imdb.genres ON imdb.genres.movie_id = imdb.movies.id
    LEFT JOIN imdb.movie_directors ON imdb.movie_directors.movie_id = imdb.movies.id
    LEFT JOIN imdb.directors ON imdb.directors.id = imdb.movie_directors.director_id
)
GROUP BY id
ORDER BY num_movies DESC;
```

Представление будет выполнено немедленно, а затем — каждую минуту, как задано в конфигурации, чтобы изменения в исходной таблице сразу отражались в нём. Наш предыдущий запрос для получения сводки по актёрам становится синтаксически проще и работает значительно быстрее!

```sql
SELECT *
FROM imdb.actor_summary
ORDER BY num_movies DESC
LIMIT 5
```


```text
┌─────id─┬─name─────────┬─num_movies─┬──avg_rank─┬─unique_genres─┬─uniq_directors─┬──────────updated_at─┐
│  45332 │ Mel Blanc    │        909 │ 5.7884793 │            19 │            148 │ 2024-11-11 12:01:35 │
│ 621468 │ Bess Flowers │        672 │  5.540605 │            20 │            301 │ 2024-11-11 12:01:35 │
│ 283127 │ Tom London   │        549 │ 2.8057034 │            18 │            208 │ 2024-11-11 12:01:35 │
│ 356804 │ Bud Osborne  │        544 │ 1.9575342 │            16 │            157 │ 2024-11-11 12:01:35 │
│  41669 │ Adoor Bhasi  │        544 │         0 │             4 │            121 │ 2024-11-11 12:01:35 │
└────────┴──────────────┴────────────┴───────────┴───────────────┴────────────────┴─────────────────────┘

5 строк в наборе. Затрачено: 0.007 сек.
```

Предположим, мы добавим нового актёра по имени &quot;Clicky McClickHouse&quot; в наши исходные данные, который, как оказалось, снимался во множестве фильмов!

```sql
INSERT INTO imdb.actors VALUES (845466, 'Clicky', 'McClickHouse', 'M');
INSERT INTO imdb.roles SELECT
        845466 AS actor_id,
        id AS movie_id,
        'Himself' AS role,
        now() AS created_at
FROM imdb.movies
LIMIT 10000, 910;
```

Менее чем через 60 секунд наша целевая таблица обновляется, отражая невероятную активность Clicky как актёра:

```sql
SELECT *
FROM imdb.actor_summary
ORDER BY num_movies DESC
LIMIT 5;
```

```text
┌─────id─┬─name────────────────┬─num_movies─┬──avg_rank─┬─unique_genres─┬─uniq_directors─┬──────────updated_at─┐
│ 845466 │ Clicky McClickHouse │        910 │ 1.4687939 │            21 │            662 │ 2024-11-11 12:53:51 │
│  45332 │ Mel Blanc           │        909 │ 5.7884793 │            19 │            148 │ 2024-11-11 12:01:35 │
│ 621468 │ Bess Flowers        │        672 │  5.540605 │            20 │            301 │ 2024-11-11 12:01:35 │
│ 283127 │ Tom London          │        549 │ 2.8057034 │            18 │            208 │ 2024-11-11 12:01:35 │
│  41669 │ Adoor Bhasi         │        544 │         0 │             4 │            121 │ 2024-11-11 12:01:35 │
└────────┴─────────────────────┴────────────┴───────────┴───────────────┴────────────────┴─────────────────────┘

5 строк в наборе. Затрачено: 0.006 сек.
```
