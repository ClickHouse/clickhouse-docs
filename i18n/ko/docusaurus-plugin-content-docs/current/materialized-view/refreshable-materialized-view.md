---
slug: /materialized-view/refreshable-materialized-view
title: '갱신 가능 구체화 뷰'
description: 'materialized view를 사용하여 쿼리를 빠르게 처리하는 방법'
keywords: ['갱신 가능 구체화 뷰', '갱신', 'materialized view', '쿼리 속도 향상', '쿼리 최적화']
doc_type: 'guide'
---

import refreshableMaterializedViewDiagram from '@site/static/images/materialized-view/refreshable-materialized-view-diagram.png';
import Image from '@theme/IdealImage';

[갱신 가능 구체화 뷰](/sql-reference/statements/create/view#refreshable-materialized-view)는 개념적으로 전통적인 OLTP 데이터베이스의 materialized view와 유사하며, 지정된 쿼리의 결과를 저장하여 빠르게 조회할 수 있게 하고, 리소스를 많이 소모하는 쿼리를 반복 실행할 필요를 줄여 줍니다. ClickHouse의 [증분형 materialized view](/materialized-view/incremental-materialized-view)와 달리, 전체 데이터셋에 대해 해당 쿼리를 주기적으로 실행해야 하며, 그 결과는 조회를 위해 대상 테이블에 저장됩니다. 이 결과 집합은 이론적으로 원래 데이터셋보다 작기 때문에 이후 쿼리가 더 빠르게 실행될 수 있습니다.

다음 다이어그램은 갱신 가능 구체화 뷰의 동작 방식을 설명합니다:

<Image img={refreshableMaterializedViewDiagram} size="lg" alt="Refreshable materialized view diagram" />

다음 동영상도 참고할 수 있습니다:

<iframe width="560" height="315" src="https://www.youtube.com/embed/-KhFJSY8yrs?si=VPRSZb20vaYkuR_C" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />


## 갱신 가능 구체화 뷰는 언제 사용해야 합니까? \{#when-should-refreshable-materialized-views-be-used\}

ClickHouse 증분형 materialized view는 매우 강력하며, 특히 단일 테이블에 대한 집계를 수행해야 하는 경우 갱신 가능 구체화 뷰가 사용하는 방식보다 일반적으로 훨씬 더 잘 확장됩니다. 데이터가 삽입될 때마다 각 데이터 블록에 대해서만 집계를 수행하고 최종 테이블에서 증분 상태를 병합하므로, 쿼리는 항상 전체 데이터가 아닌 일부 데이터에 대해서만 실행됩니다. 이 방식은 잠재적으로 페타바이트 단위의 데이터까지 확장 가능하며, 보통 선호되는 방법입니다.

그러나 이러한 증분 처리 과정이 필요하지 않거나 적용할 수 없는 사용 사례도 있습니다. 일부 문제는 증분형 접근 방식과 호환되지 않거나 실시간 업데이트가 필요하지 않고, 주기적인 재생성이 더 적절한 경우가 있습니다. 예를 들어, 복잡한 조인을 사용하여 증분형 접근 방식과 호환되지 않는 경우 전체 데이터셋에 대한 뷰를 정기적으로 완전히 재계산하고자 할 수 있습니다.

>  갱신 가능 구체화 뷰는 비정규화와 같은 작업을 수행하는 배치 프로세스를 실행할 수 있습니다. 갱신 가능 구체화 뷰 간에 종속성을 생성하여, 한 뷰가 다른 뷰의 결과에 의존하도록 하고 선행 뷰가 완료된 후에만 실행되도록 설정할 수 있습니다. 이는 예약된 워크플로우 또는 [dbt](https://www.getdbt.com/) 작업과 같은 단순한 DAG를 대체할 수 있습니다. 갱신 가능 구체화 뷰 간의 종속성 설정 방법에 대해 더 알아보려면 [CREATE VIEW](/sql-reference/statements/create/view#refresh-dependencies)의 `Dependencies` 섹션을 참조하십시오.

## 갱신 가능 구체화 뷰는 어떻게 갱신합니까? \{#how-do-you-refresh-a-refreshable-materialized-view\}

갱신 가능 구체화 뷰는 생성 시 정의한 주기에 따라 자동으로 갱신됩니다.
예를 들어, 다음 materialized view는 1분마다 자동으로 갱신됩니다:

```sql
CREATE MATERIALIZED VIEW table_name_mv
REFRESH EVERY 1 MINUTE TO table_name AS
...
```

materialized view를 강제로 갱신하려면 `SYSTEM REFRESH VIEW` 절을 사용할 수 있습니다:

```sql
SYSTEM REFRESH VIEW table_name_mv;
```

또한 뷰를 취소, 중지 또는 시작할 수 있습니다.
자세한 내용은 [갱신 가능 구체화 뷰 관리](/sql-reference/statements/system#refreshable-materialized-views) 문서를 참조하십시오.


## 갱신 가능 구체화 뷰는 마지막으로 언제 갱신되었습니까? \{#when-was-a-refreshable-materialized-view-last-refreshed\}

갱신 가능 구체화 뷰의 마지막 갱신 시점을 확인하려면 아래와 같이 [`system.view_refreshes`](/operations/system-tables/view_refreshes) 시스템 테이블을 쿼리하십시오.

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


## 새로 고침 주기를 어떻게 변경할 수 있습니까? \{#how-can-i-change-the-refresh-rate\}

갱신 가능 구체화 뷰의 새로 고침 주기를 변경하려면 [`ALTER TABLE...MODIFY REFRESH`](/sql-reference/statements/alter/view#alter-table--modify-refresh-statement) 구문을 사용하십시오.

```sql
ALTER TABLE table_name_mv
MODIFY REFRESH EVERY 30 SECONDS;
```

해당 작업을 완료한 후에는 [갱신 가능 구체화 뷰가 마지막으로 갱신된 시점은 언제인가요?](/materialized-view/refreshable-materialized-view#when-was-a-refreshable-materialized-view-last-refreshed) 쿼리를 사용하여 rate 값이 업데이트되었는지 확인할 수 있습니다:

```text
┌─database─┬─view─────────────┬─status────┬───last_success_time─┬───last_refresh_time─┬───next_refresh_time─┬─read_rows─┬─written_rows─┐
│ database │ table_name_mv    │ Scheduled │ 2024-11-11 12:22:30 │ 2024-11-11 12:22:30 │ 2024-11-11 12:23:00 │   5491132 │       817718 │
└──────────┴──────────────────┴───────────┴─────────────────────┴─────────────────────┴─────────────────────┴───────────┴──────────────┘
```


## `APPEND`를 사용하여 새 행 추가하기 \{#using-append-to-add-new-rows\}

`APPEND` 기능을 사용하면 전체 뷰를 대체하는 대신 테이블 끝에 새 행을 추가할 수 있습니다.

이 기능은 예를 들어 특정 시점의 값 스냅샷을 저장하는 데 사용할 수 있습니다. 예를 들어, [Kafka](https://kafka.apache.org/), [Redpanda](https://www.redpanda.com/) 또는 다른 스트리밍 데이터 플랫폼에서 들어오는 메시지 스트림으로 채워지는 `events` 테이블이 있다고 가정해 보겠습니다.

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

이 데이터 세트의 `uuid` 컬럼에는 `4096`개의 값이 있습니다. 총 개수가 가장 큰 값들을 찾기 위해 다음 쿼리를 사용할 수 있습니다:

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

각 `uuid`에 대해 10초마다 카운트를 집계하여 `events_snapshot`이라는 새 테이블에 저장한다고 가정해 보겠습니다. `events_snapshot`의 스키마는 다음과 같습니다.

```sql
CREATE TABLE events_snapshot (
    ts DateTime32,
    uuid String,
    count UInt64
)
ENGINE = MergeTree
ORDER BY uuid;
```

그러면 이 테이블에 데이터를 적재하기 위해 갱신 가능 구체화 뷰를 생성할 수 있습니다:

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

그런 다음 특정 `uuid`에 대해 시간에 따른 개수를 확인하기 위해 `events_snapshot`을 쿼리할 수 있습니다.


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


## 예시 \{#examples\}

이제 몇 가지 예시 데이터셋을 사용하여 갱신 가능 구체화 뷰를 어떻게 사용하는지 살펴보겠습니다.

### Stack Overflow \{#stack-overflow\}

[데이터 비정규화 가이드](/data-modeling/denormalization)에서는 Stack Overflow 데이터셋을 사용하여 데이터를 비정규화하는 다양한 기법을 설명합니다. `votes`, `users`, `badges`, `posts`, `postlinks` 테이블에 데이터를 적재합니다.

해당 가이드에서는 다음 쿼리를 사용하여 `postlinks` 데이터셋을 `posts` 테이블에 비정규화하는 방법을 보여줍니다:

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

앞서 이 데이터를 `posts_with_links` 테이블에 한 번만 삽입하는 방법을 살펴보았지만, 프로덕션 시스템에서는 이 작업을 정기적으로 실행되도록 구성하는 것이 필요합니다.

`posts` 테이블과 `postlinks` 테이블은 모두 업데이트될 수 있습니다. 따라서 증분형 materialized view를 사용해 이 조인을 구현하려고 하기보다는, 이 쿼리가 예를 들어 매시간 한 번과 같이 일정한 간격으로 실행되도록 스케줄링하고, 결과를 `post_with_links` 테이블에 저장하는 것만으로도 충분할 수 있습니다.

이럴 때 갱신 가능 구체화 뷰가 도움이 되며, 다음 쿼리로 이를 생성할 수 있습니다.

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

뷰는 즉시 실행되며, 그 이후에는 구성된 대로 매시간 실행되어 소스 테이블의 변경 사항이 반영되도록 합니다. 특히 쿼리가 다시 실행될 때 결과 집합은 원자적으로, 그리고 투명하게 업데이트됩니다.

:::note
여기에서 사용하는 구문은 증분형 materialized view와 동일하지만, [`REFRESH`](/sql-reference/statements/create/view#refreshable-materialized-view) 절을 추가로 포함합니다.
:::


### IMDb \{#imdb\}

[dbt and ClickHouse integration guide](/integrations/dbt)에서는 IMDb 데이터셋을 `actors`, `directors`, `genres`, `movie_directors`, `movies`, `roles` 테이블로 구성했습니다.

이후 다음 쿼리를 사용하면 각 배우에 대한 요약을 계산하고, 출연 영화 수가 많은 순으로 정렬할 수 있습니다.

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

결과를 반환하는 데 그리 오랜 시간이 걸리지는 않지만, 이를 더 빠르고 연산 비용도 더 적게 들도록 만들고 싶다고 가정해 보겠습니다.
또한 이 데이터셋은 지속적으로 업데이트된다고 가정합니다. 새로운 영화가 끊임없이 출시되고, 새로운 배우와 감독도 계속 등장합니다.

이제 갱신 가능 구체화 뷰를 사용할 때이므로, 먼저 결과를 저장할 대상 테이블을 생성하겠습니다:

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

이 VIEW는 즉시 한 번 실행되고, 이후에는 설정에 따라 매분 실행되어 소스 테이블의 변경 사항이 반영되도록 합니다. 앞에서 사용한 배우 요약 정보를 얻는 쿼리는 문법적으로 더 단순해지고, 실행 속도도 크게 빨라집니다!

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

원본 데이터에 새로운 배우 &quot;Clicky McClickHouse&quot;를 추가했는데, 이 배우가 매우 많은 영화에 출연했다고 가정해 보겠습니다.

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

60초도 지나지 않아 대상 테이블이 업데이트되어 Clicky의 왕성한 출연 활동이 반영됩니다.

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
