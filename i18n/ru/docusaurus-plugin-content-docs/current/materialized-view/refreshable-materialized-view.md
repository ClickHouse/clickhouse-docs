---
slug: /materialized-view/refreshable-materialized-view
title: 'Обновляемое материализованное представление'
description: 'Как использовать материализованные представления для ускорения запросов'
keywords: ['обновляемое материализованное представление', 'обновление', 'материализованные представления', 'ускорение запросов', 'оптимизация запросов']
---

import refreshableMaterializedViewDiagram from '@site/static/images/materialized-view/refreshable-materialized-view-diagram.png';
import Image from '@theme/IdealImage';

[Обновляемые материализованные представления](/sql-reference/statements/create/view#refreshable-materialized-view) концептуально схожи с материализованными представлениями в традиционных OLTP базах данных, они хранят результат заданного запроса для быстрого извлечения и снижают необходимость многократного выполнения ресурсоемких запросов. В отличие от [инкрементных материализованных представлений](/materialized-view/incremental-materialized-view) в ClickHouse, требуется периодическое выполнение запроса по полному набору данных - результаты которого хранятся в целевой таблице для выполнения запроса. Этот набор результатов, как правило, должен быть меньше оригинального набора данных, что позволяет последующему запросу выполняться быстрее.

Диаграмма объясняет, как работают обновляемые материализованные представления:

<Image img={refreshableMaterializedViewDiagram} size="lg" alt="Диаграмма обновляемого материализованного представления"/>


Вы также можете посмотреть следующее видео:

<iframe width="560" height="315" src="https://www.youtube.com/embed/-KhFJSY8yrs?si=VPRSZb20vaYkuR_C" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>


## Когда следует использовать обновляемые материализованные представления? {#when-should-refreshable-materialized-views-be-used}

Инкрементные материализованные представления ClickHouse обладаются огромной мощностью и, как правило, масштабируются намного лучше, чем подход, используемый обновляемыми материализованными представлениями, особенно в случаях, когда необходимо провести агрегацию над одной таблицей. Путем выполнения агрегации только на каждом блоке данных по мере его вставки и слияния инкрементных состояний в окончательной таблице, запрос выполняется только на подмножестве данных. Этот метод может масштабироваться до потенциальных петабайт данных и, как правило, является предпочтительным методом.

Тем не менее, существуют случаи использования, в которых этот инкрементный процесс не требуется или не применим. Некоторые задачи несовместимы с инкрементным подходом или не требуют обновлений в реальном времени, при этом периодическое восстановление будет более уместным. Например, вы можете периодически выполнять полное пересчитывание представления по полному набору данных, потому что оно использует сложное соединение, что несовместимо с инкрементным подходом.

> Обновляемые материализованные представления могут выполнять пакетные процессы, выполняя такие задачи, как денормализация. Можно создать зависимости между обновляемыми материализованными представлениями, при этом одно представление зависит от результатов другого и выполняется только после его завершения. Это может заменить запланированные рабочие процессы или простые DAG, такие как [dbt](https://www.getdbt.com/). Чтобы узнать больше о том, как установить зависимости между обновляемыми материализованными представлениями, перейдите в раздел [СОЗДАТЬ ПРЕДСТАВЛЕНИЕ](/sql-reference/statements/create/view#refresh-dependencies), раздел `Зависимости`.

## Как обновить обновляемое материализованное представление? {#how-do-you-refresh-a-refreshable-materialized-view}

Обновляемые материализованные представления автоматически обновляются с интервалом, определенным во время создания.
Например, следующее материализованное представление обновляется каждую минуту:

```sql
CREATE MATERIALIZED VIEW table_name_mv
REFRESH EVERY 1 MINUTE TO table_name AS
...
```

Если нужно принудительно обновить материализованное представление, вы можете использовать конструкцию `SYSTEM REFRESH VIEW`:

```sql
SYSTEM REFRESH VIEW table_name_mv;
```

Вы также можете отменить, остановить или начать представление.
Для получения дополнительной информации смотрите документацию по [управлению обновляемыми материализованными представлениями](/sql-reference/statements/system#refreshable-materialized-views).

## Когда последний раз обновлялось обновляемое материализованное представление? {#when-was-a-refreshable-materialized-view-last-refreshed}

Чтобы узнать, когда в последний раз обновлялось обновляемое материализованное представление, вы можете выполнить запрос к системной таблице [`system.view_refreshes`](/operations/system-tables/view_refreshes), как показано ниже:

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

## Как я могу изменить частоту обновления? {#how-can-i-change-the-refresh-rate}

Чтобы изменить частоту обновления обновляемого материализованного представления, используйте синтаксис [`ALTER TABLE...MODIFY REFRESH`](/sql-reference/statements/alter/view#alter-table--modify-refresh-statement).

```sql
ALTER TABLE table_name_mv
MODIFY REFRESH EVERY 30 SECONDS;
```

После этого вы можете использовать запрос [Когда последний раз обновлялось обновляемое материализованное представление?](/materialized-view/refreshable-materialized-view#when-was-a-refreshable-materialized-view-last-refreshed), чтобы проверить, что частота была обновлена:

```text
┌─database─┬─view─────────────┬─status────┬───last_success_time─┬───last_refresh_time─┬───next_refresh_time─┬─read_rows─┬─written_rows─┐
│ database │ table_name_mv    │ Scheduled │ 2024-11-11 12:22:30 │ 2024-11-11 12:22:30 │ 2024-11-11 12:23:00 │   5491132 │       817718 │
└──────────┴──────────────────┴───────────┴─────────────────────┴─────────────────────┴─────────────────────┴───────────┴──────────────┘
```

## Использование `APPEND` для добавления новых строк {#using-append-to-add-new-rows}

Функция `APPEND` позволяет добавлять новые строки в конец таблицы вместо замены всего представления.

Одно из использований этой функции - захват снимков значений в определенный момент времени. Например, предположим, что у нас есть таблица `events`, заполняемая потоком сообщений из [Kafka](https://kafka.apache.org/), [Redpanda](https://www.redpanda.com/) или другой платформы потоковых данных.

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

Этот набор данных содержит `4096` значений в колонке `uuid`. Мы можем написать следующий запрос, чтобы найти те, у кого максимальное общее количество:

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

Допустим, мы хотим фиксировать количество для каждого `uuid` каждые 10 секунд и хранить это в новой таблице под названием `events_snapshot`. Схема `events_snapshot` будет выглядеть следующим образом:

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

Затем мы можем выполнить запрос к `events_snapshot` чтобы получить количество с течением времени для конкретного `uuid`:

```sql
SELECT *
FROM events_snapshot
WHERE uuid = 'fff'
ORDER BY ts ASC
FORMAT PrettyCompactMonoBlock

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

## Примеры {#examples}

Теперь давайте рассмотрим, как использовать обновляемые материализованные представления на примерах наборов данных.

### Stack Overflow {#stack-overflow}

Руководство по [денормализации данных](/data-modeling/denormalization) демонстрирует различные техники денормализации данных с использованием набора данных Stack Overflow. Мы заполняем данные в следующие таблицы: `votes`, `users`, `badges`, `posts` и `postlinks`.

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

Затем мы показали, как выполнить одноразовую вставку этих данных в таблицу `posts_with_links`, но в производственной системе мы хотели бы выполнять эту операцию периодически.

Как таблицы `posts`, так и `postlinks` могут потенциально обновляться. Поэтому вместо того, чтобы пытаться реализовать это соединение с использованием инкрементных материализованных представлений, может быть достаточно просто запланировать выполнение этого запроса через установленный интервал, например, раз в час, храня результаты в таблице `post_with_links`.

Здесь обновляемое материализованное представление может помочь, и мы можем создать его с помощью следующего запроса:

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

Представление будет выполняться немедленно и каждый час после этого, как настроено, чтобы обеспечить отражение обновлений исходной таблицы. Важно, что при повторном запуске запроса набор результатов атомарно и прозрачно обновляется.

:::note
Синтаксис здесь идентичен инкрементному материализованному представлению, за исключением того, что мы включаем конструкцию [`REFRESH`](/sql-reference/statements/create/view#refreshable-materialized-view):
:::

### IMDb {#imdb}

В [руководстве по интеграции dbt и ClickHouse](/integrations/dbt#dbt) мы заполнили набор данных IMDb следующими таблицами: `actors`, `directors`, `genres`, `movie_directors`, `movies` и `roles`.

Затем мы можем написать следующий запрос, который можно использовать для вычисления сводки по каждому актеру, отсортированной по количеству появлений в фильмах.

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

5 rows in set. Elapsed: 0.393 sec. Processed 5.45 million rows, 86.82 MB (13.87 million rows/s., 221.01 MB/s.)
Peak memory usage: 1.38 GiB.
```

Не занимает много времени, чтобы вернуть результат, но давайте скажем, что мы хотим, чтобы это было еще быстрее и менее ресурсозатратно. Предположим, что этот набор данных также постоянно обновляется - фильмы постоянно выходят, и новые актеры также появляются.

Пора создавать обновляемое материализованное представление, поэтому давайте сначала создадим целевую таблицу для результатов:

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

Теперь мы можем определить представление:

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

Представление будет выполняться немедленно и каждую минуту после этого, как настроено, чтобы обеспечить отражение обновлений исходной таблицы. Наш предыдущий запрос на получение сводки актеров становится синтаксически проще и значительно быстрее!

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

5 rows in set. Elapsed: 0.007 sec.
```

Предположим, мы добавляем нового актера, "Clicky McClickHouse", в наши исходные данные, который, как оказалось, появился в множестве фильмов!

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

Менее чем через 60 секунд наша целевая таблица обновляется, чтобы отразить плодовитую натуру актёрской карьеры Clicky:

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

5 rows in set. Elapsed: 0.006 sec.
```
