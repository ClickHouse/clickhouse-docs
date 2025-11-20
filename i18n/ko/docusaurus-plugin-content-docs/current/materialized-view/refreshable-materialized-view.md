---
'slug': '/materialized-view/refreshable-materialized-view'
'title': '새로 고칠 수 있는 물리화된 뷰'
'description': '물리화된 뷰를 사용하여 쿼리를 빠르게 하는 방법'
'keywords':
- 'refreshable materialized view'
- 'refresh'
- 'materialized views'
- 'speed up queries'
- 'query optimization'
'doc_type': 'guide'
---

import refreshableMaterializedViewDiagram from '@site/static/images/materialized-view/refreshable-materialized-view-diagram.png';
import Image from '@theme/IdealImage';

[Refreshable materialized views](/sql-reference/statements/create/view#refreshable-materialized-view)는 개념적으로 전통적인 OLTP 데이터베이스의 물리화된 뷰와 유사하며, 지정된 쿼리의 결과를 저장하여 빠른 검색을 가능하게 하고, 반복적으로 자원 집약적인 쿼리를 실행할 필요를 줄입니다. ClickHouse의 [증분 물리화된 뷰](/materialized-view/incremental-materialized-view)와 달리, 이는 전체 데이터 세트에 대해 주기적으로 쿼리를 실행해야 하며, 쿼리를 위해 결과가 타겟 테이블에 저장됩니다. 이 결과 집합은 이론적으로 원본 데이터 세트보다 작아야 하며, 후속 쿼리가 더 빠르게 실행될 수 있습니다.

다음 다이어그램은 Refreshable Materialized Views의 작동 방식을 설명합니다:

<Image img={refreshableMaterializedViewDiagram} size="lg" alt="Refreshable materialized view diagram"/>

다음 비디오도 확인할 수 있습니다:

<iframe width="560" height="315" src="https://www.youtube.com/embed/-KhFJSY8yrs?si=VPRSZb20vaYkuR_C" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Refreshable materialized views를 언제 사용해야 하나요? {#when-should-refreshable-materialized-views-be-used}

ClickHouse 증분 물리화된 뷰는 매우 강력하며, 보통 Refreshable materialized views가 사용하는 접근 방식보다 적절하게 확장됩니다. 이는 특히 단일 테이블에 대한 집계를 수행해야 하는 경우에 해당됩니다. 데이터가 삽입될 때마다 각 데이터 블록에 대한 집계만 계산하고, 최종 테이블에서 증분 상태를 병합함으로써 쿼리는 데이터의 하위 집합에서만 실행됩니다. 이 방법은 잠재적으로 페타바이트 규모의 데이터까지 확장 가능하며, 일반적으로 선호되는 방법입니다.

그러나 이 증분 프로세스가 필요하지 않거나 적용되지 않는 사용 사례가 있습니다. 일부 문제는 증분 접근 방식과 호환되지 않거나 실시간 업데이트가 필요하지 않아 주기적으로 다시 빌드하는 것이 더 적합할 수 있습니다. 예를 들어, 복잡한 조인으로 인해 Incremental 접근 방식과 상충하는 이유로 전체 데이터 세트에 대해 뷰의 완전한 재계산을 정기적으로 수행하고 싶을 수 있습니다.

> Refreshable materialized views는 비정규화를 수행하는 배치 프로세스를 실행할 수 있습니다. Refreshable materialized views 간에 종속성을 생성할 수 있으며, 한 뷰가 다른 뷰의 결과에 의존하고 완료될 때만 실행됩니다. 이는 스케줄된 워크플로우나 [dbt](https://www.getdbt.com/) 작업과 같은 간단한 DAG를 대체할 수 있습니다. Refreshable materialized views 간의 종속성을 설정하는 방법에 대한 자세한 내용은 [CREATE VIEW](/sql-reference/statements/create/view#refresh-dependencies) 문서의 `Dependencies` 섹션을 참조하세요.

## Refreshable materialized view를 어떻게 새로 고칠 수 있나요? {#how-do-you-refresh-a-refreshable-materialized-view}

Refreshable materialized views는 생성 중에 정의된 간격에 따라 자동으로 새로 고쳐집니다. 예를 들어, 다음 물리화된 뷰는 매 분마다 새로 고쳐집니다:

```sql
CREATE MATERIALIZED VIEW table_name_mv
REFRESH EVERY 1 MINUTE TO table_name AS
...
```

물리화된 뷰를 강제로 새로 고치고 싶다면, `SYSTEM REFRESH VIEW` 절을 사용할 수 있습니다:

```sql
SYSTEM REFRESH VIEW table_name_mv;
```

뷰를 취소, 정지 또는 시작할 수도 있습니다. 더 자세한 내용은 [Refreshable materialized views 관리하기](/sql-reference/statements/system#refreshable-materialized-views) 문서를 참조하세요.

## Refreshable materialized view가 마지막으로 새로 고쳐진 것은 언제인가요? {#when-was-a-refreshable-materialized-view-last-refreshed}

Refreshable materialized view가 마지막으로 새로 고쳐진 시간을 확인하려면, 아래와 같이 [`system.view_refreshes`](/operations/system-tables/view_refreshes) 시스템 테이블에 쿼리를 실행할 수 있습니다:

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

## 새로 고침 속도를 어떻게 변경할 수 있나요? {#how-can-i-change-the-refresh-rate}

Refreshable materialized view의 새로 고침 속도를 변경하려면 [`ALTER TABLE...MODIFY REFRESH`](/sql-reference/statements/alter/view#alter-table--modify-refresh-statement) 구문을 사용하세요.

```sql
ALTER TABLE table_name_mv
MODIFY REFRESH EVERY 30 SECONDS;
```

그 후, [Refreshable materialized view가 마지막으로 새로 고쳐진 것은 언제인가요?](/materialized-view/refreshable-materialized-view#when-was-a-refreshable-materialized-view-last-refreshed) 쿼리를 사용하여 속도가 업데이트되었는지 확인할 수 있습니다:

```text
┌─database─┬─view─────────────┬─status────┬───last_success_time─┬───last_refresh_time─┬───next_refresh_time─┬─read_rows─┬─written_rows─┐
│ database │ table_name_mv    │ Scheduled │ 2024-11-11 12:22:30 │ 2024-11-11 12:22:30 │ 2024-11-11 12:23:00 │   5491132 │       817718 │
└──────────┴──────────────────┴───────────┴─────────────────────┴─────────────────────┴─────────────────────┴───────────┴──────────────┘
```

## `APPEND`를 사용해 새 행 추가하기 {#using-append-to-add-new-rows}

`APPEND` 기능은 전체 뷰를 교체하는 대신 테이블 끝에 새 행을 추가할 수 있습니다.

이 기능의 한 가지 용도는 특정 시점의 값을 스냅샷으로 캡처하는 것입니다. 예를 들어, [Kafka](https://kafka.apache.org/), [Redpanda](https://www.redpanda.com/) 또는 다른 스트리밍 데이터 플랫폼의 메시지 스트림으로 채워진 `events` 테이블이 있다고 가정해 보겠습니다.

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

이 데이터 세트는 `uuid` 컬럼에 `4096`개의 값을 가지고 있습니다. 가장 총 카운트가 높은 값을 찾기 위해 다음 쿼리를 작성할 수 있습니다:

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

각 `uuid`에 대한 카운트를 10초마다 캡처하고 `events_snapshot`이라는 새 테이블에 저장하고 싶다고 가정해 보겠습니다. `events_snapshot`의 스키마는 다음과 같을 것입니다:

```sql
CREATE TABLE events_snapshot (
    ts DateTime32,
    uuid String,
    count UInt64
)
ENGINE = MergeTree
ORDER BY uuid;
```

그런 다음 이 테이블을 채우기 위한 Refreshable materialized view를 생성할 수 있습니다:

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

그 후, 특정 `uuid`에 대한 시간에 따른 카운트를 가져오기 위해 `events_snapshot`에 쿼리할 수 있습니다:

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

## 예시 {#examples}

이제 Refreshable materialized views를 사용하는 방법을 몇 가지 예제 데이터 세트와 함께 살펴보겠습니다.

### Stack Overflow {#stack-overflow}

[데이터 비정규화 가이드](/data-modeling/denormalization)에서는 Stack Overflow 데이터 세트를 사용하여 비정규화 데이터를 위한 다양한 기술을 보여줍니다. 우리는 `votes`, `users`, `badges`, `posts`, `postlinks` 테이블에 데이터를 채웁니다.

그 가이드에서는 다음 쿼리를 사용하여 `postlinks` 데이터 세트를 `posts` 테이블에 비정규화하는 방법을 보여주었습니다:

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

그런 다음 이 데이터를 `posts_with_links` 테이블에 한 번만 삽입하는 방법을 보여주었지만, 생산 시스템에서는 이 작업을 주기적으로 실행하도록 설정하고 싶을 것입니다.

`posts`와 `postlinks` 테이블 모두 업데이트될 가능성이 있습니다. 그러므로 증분 물리화된 뷰를 사용하여 이 조인을 구현하려고 시도하기보다는 이 쿼리를 정해진 간격으로 실행하도록 예약하는 것이 충분할 수 있습니다. 예를 들어, 매시간 한 번 실행하며 결과를 `post_with_links` 테이블에 저장하는 것입니다.

이때 Refreshable materialized view가 도움이 되며, 다음 쿼리를 사용하여 생성할 수 있습니다:

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

뷰는 즉시 실행되며, 이후 설정한 대로 매시간 실행됩니다. 소스 테이블의 업데이트가 반영되도록 보장합니다. 중요한 것은 쿼리 재실행 시 결과 집합이 원자적으로 투명하게 업데이트된다는 것입니다.

:::note
여기서 구문은 증분 물리화된 뷰와 동일하지만, [`REFRESH`](/sql-reference/statements/create/view#refreshable-materialized-view) 절을 포함합니다:
:::

### IMDb {#imdb}

[dbt와 ClickHouse 통합 가이드](/integrations/dbt)에서는 `actors`, `directors`, `genres`, `movie_directors`, `movies`, `roles` 테이블로 IMDb 데이터 세트를 채웁니다.

그런 다음 가장 많은 영화 출연 순으로 각 배우를 요약하는 쿼리를 다음과 같이 작성할 수 있습니다:

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

결과를 반환하는 데 그리 오랜 시간이 걸리지 않지만, 더 빠르고 계산 비용이 적은 결과를 원한다고 가정해 보겠습니다. 이 데이터 세트가 지속적으로 업데이트되고 있다고 가정합시다. 영화가 지속적으로 출시되고 새로운 배우와 감독이 등장하고 있습니다.

이제 Refreshable materialized view의 시간이므로 먼저 결과를 위한 타겟 테이블을 생성해 보겠습니다:

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

이제 뷰를 정의할 수 있습니다:

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

뷰는 즉시 실행되며, 이후 설정한 대로 매분 실행되어 소스 테이블의 업데이트가 반영됩니다. 배우 요약을 얻기 위한 이전 쿼리는 구문적으로 더 단순하고 상당히 빨라집니다!

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

새로운 배우 "Clicky McClickHouse"가 우리가 가진 소스 데이터에 추가되고, 그는 많은 영화에 출연했다면 어떻게 될까요?

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

60초도 지나지 않아, 우리의 타겟 테이블은 Clicky의 활동적인 본성을 반영하여 업데이트됩니다:

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
