---
slug: /materialized-view/refreshable-materialized-view
title: 'Обновляемое материализованное представление'
description: 'Как использовать материализованные представления для ускорения выполнения запросов'
keywords: ['обновляемое материализованное представление', 'обновление', 'материализованные представления', 'ускорение выполнения запросов', 'оптимизация запросов']
doc_type: 'guide'
---

import refreshableMaterializedViewDiagram from '@site/static/images/materialized-view/refreshable-materialized-view-diagram.png';
import Image from '@theme/IdealImage';

[Обновляемые материализованные представления](/sql-reference/statements/create/view#refreshable-materialized-view) концептуально похожи на материализованные представления в традиционных OLTP-базах данных: они хранят результат заданного запроса для быстрого доступа и уменьшают необходимость многократно выполнять ресурсоемкие запросы. В отличие от [инкрементных материализованных представлений](/materialized-view/incremental-materialized-view) ClickHouse, здесь требуется периодическое выполнение запроса по всему набору данных, результаты которого сохраняются в целевой таблице, из которой затем выполняются запросы. Теоретически этот результирующий набор данных должен быть меньше исходного набора, что позволяет выполнять последующие запросы быстрее.

На диаграмме показано, как работают обновляемые материализованные представления:

<Image img={refreshableMaterializedViewDiagram} size="lg" alt="Диаграмма обновляемого материализованного представления" />

Также вы можете просмотреть следующее видео:

<iframe width="560" height="315" src="https://www.youtube.com/embed/-KhFJSY8yrs?si=VPRSZb20vaYkuR_C" title="Проигрыватель видео YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

## Когда следует использовать обновляемые материализованные представления? {#when-should-refreshable-materialized-views-be-used}

Инкрементные материализованные представления в ClickHouse чрезвычайно мощны и, как правило, масштабируются значительно лучше, чем подход, используемый обновляемыми материализованными представлениями, особенно в случаях, когда необходимо выполнить агрегирование по одной таблице. Поскольку агрегирование вычисляется только для каждого блока данных в момент вставки, а инкрементные состояния сливаются в итоговую таблицу, запрос всегда выполняется только над подмножеством данных. Этот метод масштабируется вплоть до петабайт данных и обычно является предпочтительным.

Однако существуют сценарии, когда этот инкрементный процесс не требуется или неприменим. Некоторые задачи либо несовместимы с инкрементным подходом, либо не требуют обновлений в режиме реального времени, и более уместной является периодическая перестройка. Например, может потребоваться регулярно выполнять полный пересчёт представления над всем набором данных, поскольку оно использует сложное соединение, которое несовместимо с инкрементным подходом.

>  Обновляемые материализованные представления могут запускать пакетные процессы, выполняющие такие задачи, как денормализация. Между обновляемыми материализованными представлениями можно создавать зависимости таким образом, что одно представление зависит от результатов другого и выполняется только после его завершения. Это может заменить планировщик рабочих процессов или простые DAG, такие как задание [dbt](https://www.getdbt.com/). Чтобы узнать больше о том, как задавать зависимости между обновляемыми материализованными представлениями, перейдите к разделу `Dependencies` на странице [CREATE VIEW](/sql-reference/statements/create/view#refresh-dependencies).

## Как происходит обновление обновляемого материализованного представления? {#how-do-you-refresh-a-refreshable-materialized-view}

Обновляемые материализованные представления автоматически обновляются с интервалом, который задаётся при их создании.
Например, следующее материализованное представление обновляется каждую минуту:

```sql
CREATE MATERIALIZED VIEW table_name_mv
REFRESH EVERY 1 MINUTE TO table_name AS
...
```

Если вы хотите принудительно обновить материализованное представление, можно использовать оператор `SYSTEM REFRESH VIEW`:

```sql
SYSTEM REFRESH VIEW table_name_mv;
```

Вы также можете отменять, останавливать и запускать обновление представления.
Дополнительные сведения см. в документации [по управлению обновляемыми материализованными представлениями](/sql-reference/statements/system#refreshable-materialized-views).

## Когда обновляемое материализованное представление обновлялось в последний раз? {#when-was-a-refreshable-materialized-view-last-refreshed}

Чтобы узнать время последнего обновления обновляемого материализованного представления, вы можете выполнить запрос к системной таблице [`system.view_refreshes`](/operations/system-tables/view_refreshes), как показано ниже:

```sql
SELECT database, view, status,
       last_success_time, last_refresh_time, next_refresh_time,
       read_rows, written_rows
FROM system.view_refreshes;
```

```text
┌─database─┬─view─────────────┬─status────┬───last_success_time─┬───last_refresh_time─┬───next_refresh_time─┬─read_rows─┬─written_rows─┐
│ database │ table_name_mv    │ Запланировано │ 2024-11-11 12:10:00 │ 2024-11-11 12:10:00 │ 2024-11-11 12:11:00 │   5491132 │       817718 │
└──────────┴──────────────────┴───────────┴─────────────────────┴─────────────────────┴─────────────────────┴───────────┴──────────────┘
```

## Как изменить частоту обновления? {#how-can-i-change-the-refresh-rate}

Чтобы изменить частоту обновления обновляемого материализованного представления, используйте синтаксис [`ALTER TABLE...MODIFY REFRESH`](/sql-reference/statements/alter/view#alter-table--modify-refresh-statement).

```sql
ALTER TABLE table_name_mv
MODIFY REFRESH EVERY 30 SECONDS;
```

После этого вы можете выполнить запрос [Когда в последний раз обновлялось обновляемое материализованное представление?](/materialized-view/refreshable-materialized-view#when-was-a-refreshable-materialized-view-last-refreshed), чтобы убедиться, что частота обновления обновилась:

```text
┌─database─┬─view─────────────┬─status────┬───last_success_time─┬───last_refresh_time─┬───next_refresh_time─┬─read_rows─┬─written_rows─┐
│ database │ table_name_mv    │ Запланировано │ 2024-11-11 12:22:30 │ 2024-11-11 12:22:30 │ 2024-11-11 12:23:00 │   5491132 │       817718 │
└──────────┴──────────────────┴───────────┴─────────────────────┴─────────────────────┴─────────────────────┴───────────┴──────────────┘
```

## Использование `APPEND` для добавления новых строк {#using-append-to-add-new-rows}

Функция `APPEND` позволяет добавлять новые строки в конец таблицы вместо замены всего представления.

Одно из применений этой возможности — создание снимков значений в определённый момент времени. Например, представим, что у нас есть таблица `events`, которую заполняет поток сообщений из [Kafka](https://kafka.apache.org/), [Redpanda](https://www.redpanda.com/) или другой платформы потоковой передачи данных.

```sql
SELECT *
FROM events
LIMIT 10

ID запроса: 7662bc39-aaf9-42bd-b6c7-bc94f2881036

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

В этом наборе данных в столбце `uuid` содержится `4096` значений. Мы можем написать следующий запрос, чтобы найти те из них, у которых наибольшее суммарное количество:

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

Предположим, мы хотим каждые 10 секунд получать количество записей для каждого `uuid` и сохранять его в новой таблице `events_snapshot`. Схема таблицы `events_snapshot` будет выглядеть следующим образом:

```sql
CREATE TABLE events_snapshot (
    ts DateTime32,
    uuid String,
    count UInt64
)
ENGINE = MergeTree
ORDER BY uuid;
```

Затем мы можем создать обновляемое материализованное представление, которое будет заполнять эту таблицу:

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

Затем мы можем выполнить запрос к `events_snapshot`, чтобы получить временной ряд количества для конкретного `uuid`:

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

Теперь давайте рассмотрим, как использовать обновляемые материализованные представления на примере нескольких наборов данных.

### Stack Overflow {#stack-overflow}

В [руководстве по денормализации данных](/data-modeling/denormalization) показаны различные методы денормализации данных с использованием набора данных Stack Overflow. Мы заполняем данными следующие таблицы: `votes`, `users`, `badges`, `posts` и `postlinks`.

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

Затем мы показали, как выполнить разовую вставку этих данных в таблицу `posts_with_links`, но в производственной среде нам нужно запускать эту операцию периодически.

Обе таблицы — `posts` и `postlinks` — потенциально могут изменяться. Поэтому, вместо того чтобы пытаться реализовать это соединение с использованием инкрементных материализованных представлений, часто бывает достаточно просто запланировать выполнение этого запроса с фиксированным интервалом, например раз в час, сохраняя результаты в таблице `post_with_links`.

В таком случае помогает обновляемое материализованное представление, и мы можем создать его с помощью следующего запроса:

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

Представление будет выполнено немедленно, а затем каждый час, согласно настройкам, чтобы гарантировать, что обновления в исходной таблице отражаются в нём. Важно, что при повторном выполнении запроса результирующий набор данных обновляется атомарно и прозрачно.

:::note
Синтаксис здесь идентичен инкрементальному материализованному представлению, за исключением того, что мы добавляем оператор [`REFRESH`](/sql-reference/statements/create/view#refreshable-materialized-view):
:::

### IMDb {#imdb}

В [руководстве по интеграции dbt и ClickHouse](/integrations/dbt) мы заполнили набор данных IMDb следующими таблицами: `actors`, `directors`, `genres`, `movie_directors`, `movies` и `roles`.

Затем мы можем написать следующий запрос для вычисления сводной информации по каждому актёру, упорядоченной по числу появлений в фильмах.

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

5 строк в наборе. Прошло: 0.393 сек. Обработано 5.45 миллионов строк, 86.82 МБ (13.87 миллионов строк/с., 221.01 МБ/с.)
Пиковое использование памяти: 1.38 ГиБ.
```

Получение результата занимает не так уж много времени, но предположим, что мы хотим сделать это ещё быстрее и менее ресурсоёмко.
Допустим, этот набор данных также постоянно обновляется — фильмы постоянно выходят, а новые актёры и режиссёры продолжают появляться.

Пришло время для обновляемого материализованного представления, поэтому сначала создадим целевую таблицу для результатов:

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

Теперь можно определить представление:

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

Представление будет выполнено сразу, а затем — каждую минуту, как задано в конфигурации, чтобы изменения в исходной таблице сразу отражались в нём. Наш прежний запрос, получавший сводную информацию об актёрах, стал синтаксически проще и значительно быстрее!

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

Получено 5 строк. Время выполнения: 0.007 сек.
```

Предположим, мы добавим в наши исходные данные нового актёра по имени «Clicky McClickHouse», который, как выясняется, снялся во множестве фильмов!

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

Менее чем через 60 секунд наша целевая таблица обновляется и отражает активную актёрскую деятельность Клики:

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
