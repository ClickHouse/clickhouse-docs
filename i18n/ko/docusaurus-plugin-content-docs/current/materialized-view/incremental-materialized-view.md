---
'slug': '/materialized-view/incremental-materialized-view'
'title': '증분 물리화된 뷰'
'description': '쿼리를 빠르게 하기 위해 증분 물리화된 뷰를 사용하는 방법'
'keywords':
- 'incremental materialized views'
- 'speed up queries'
- 'query optimization'
'score': 10000
'doc_type': 'guide'
---

import materializedViewDiagram from '@site/static/images/materialized-view/materialized-view-diagram.png';
import Image from '@theme/IdealImage';

## Background {#background}

증분 물리화된 뷰(Incremental Materialized Views)는 사용자가 쿼리 시간에서 삽입 시간으로 계산 비용을 전이하여 `SELECT` 쿼리를 더 빠르게 만들 수 있게 합니다.

Postgres와 같은 트랜잭션 데이터베이스와 달리, ClickHouse의 물리화된 뷰는 테이블에 데이터가 삽입될 때 블록의 데이터에 대해 쿼리를 실행하는 트리거 역할을 합니다. 이 쿼리의 결과는 두 번째 "대상" 테이블에 삽입됩니다. 추가 행이 삽입되면 결과는 다시 대상 테이블로 전송되어 중간 결과가 업데이트되고 병합됩니다. 이 병합된 결과는 모든 원본 데이터에 대해 쿼리를 실행하는 것과 동일합니다.

물리화된 뷰의 주요 동기는 대상 테이블에 삽입된 결과가 행에 대한 집계, 필터링 또는 변환의 결과를 나타낸다는 것입니다. 이러한 결과는 종종 원본 데이터의 더 작은 표현(집계의 경우 부분 스케치)으로 존재합니다. 이는 결과적으로 대상 테이블에서 결과를 읽는 쿼리가 단순하게 되어 계산이 원본 데이터에서 수행될 때보다 쿼리 시간이 빠르도록 합니다. 즉, 계산(따라서 쿼리 대기 시간)이 쿼리 시간에서 삽입 시간으로 이동하게 됩니다.

ClickHouse의 물리화된 뷰는 기반 테이블에 데이터가 흐를 때 실시간으로 업데이트되며, 지속적으로 업데이트되는 인덱스처럼 기능합니다. 이는 다른 데이터베이스와는 달리 물리화된 뷰는 일반적으로 새로 고쳐야 하는 정적 스냅샷입니다(ClickHouse의 [Refreshable Materialized Views](/sql-reference/statements/create/view#refreshable-materialized-view)와 유사함).

<Image img={materializedViewDiagram} size="md" alt="Materialized view diagram"/>

## Example {#example}

예를 들어, 우리는 ["Schema Design"](/data-modeling/schema-design)에서 문서화된 Stack Overflow 데이터 세트를 사용하겠습니다.

게시물에 대한 하루의 좋아요와 싫어요 수를 얻기를 원한다고 가정해 봅시다.

```sql
CREATE TABLE votes
(
    `Id` UInt32,
    `PostId` Int32,
    `VoteTypeId` UInt8,
    `CreationDate` DateTime64(3, 'UTC'),
    `UserId` Int32,
    `BountyAmount` UInt8
)
ENGINE = MergeTree
ORDER BY (VoteTypeId, CreationDate, PostId)

INSERT INTO votes SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/*.parquet')

0 rows in set. Elapsed: 29.359 sec. Processed 238.98 million rows, 2.13 GB (8.14 million rows/s., 72.45 MB/s.)
```

이 쿼리는 [`toStartOfDay`](/sql-reference/functions/date-time-functions#toStartOfDay) 함수 덕분에 ClickHouse에서 비교적 간단합니다:

```sql
SELECT toStartOfDay(CreationDate) AS day,
       countIf(VoteTypeId = 2) AS UpVotes,
       countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY day
ORDER BY day ASC
LIMIT 10

┌─────────────────day─┬─UpVotes─┬─DownVotes─┐
│ 2008-07-31 00:00:00 │       6 │         0 │
│ 2008-08-01 00:00:00 │     182 │        50 │
│ 2008-08-02 00:00:00 │     436 │       107 │
│ 2008-08-03 00:00:00 │     564 │       100 │
│ 2008-08-04 00:00:00 │    1306 │       259 │
│ 2008-08-05 00:00:00 │    1368 │       269 │
│ 2008-08-06 00:00:00 │    1701 │       211 │
│ 2008-08-07 00:00:00 │    1544 │       211 │
│ 2008-08-08 00:00:00 │    1241 │       212 │
│ 2008-08-09 00:00:00 │     576 │        46 │
└─────────────────────┴─────────┴───────────┘

10 rows in set. Elapsed: 0.133 sec. Processed 238.98 million rows, 2.15 GB (1.79 billion rows/s., 16.14 GB/s.)
Peak memory usage: 363.22 MiB.
```

이 쿼리는 ClickHouse 덕분에 이미 빠르지만, 더 나은 방법이 있을까요?

물리화된 뷰를 사용하여 삽입 시간에 이것을 계산하려면 결과를 받을 테이블이 필요합니다. 이 테이블은 하루에 대해 1행만 유지해야 합니다. 기존 날짜에 대한 업데이트가 수신되면 다른 열이 기존 날짜의 행에 병합되어야 합니다. 이 증분 상태의 병합이 발생하려면 다른 열에 대한 부분 상태가 저장되어야 합니다.

이렇게 하려면 ClickHouse에서 특별한 엔진 유형이 필요합니다: [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree). 이는 동일한 정렬 키를 가진 행들을 숫자 열의 합계 값으로 포함하는 1행으로 대체합니다. 다음 테이블은 동일한 날짜의 모든 행을 병합하고, 숫자 열을 합계합니다:

```sql
CREATE TABLE up_down_votes_per_day
(
  `Day` Date,
  `UpVotes` UInt32,
  `DownVotes` UInt32
)
ENGINE = SummingMergeTree
ORDER BY Day
```

물리화된 뷰를 시연하기 위해, 우리의 투표 테이블이 비어 있다고 가정하고 아직 데이터를 수신하지 않았습니다. 우리의 물리화된 뷰는 `votes`에 삽입된 데이터에 대해 위의 `SELECT`를 수행하고, 그 결과를 `up_down_votes_per_day`에 보냅니다:

```sql
CREATE MATERIALIZED VIEW up_down_votes_per_day_mv TO up_down_votes_per_day AS
SELECT toStartOfDay(CreationDate)::Date AS Day,
       countIf(VoteTypeId = 2) AS UpVotes,
       countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY Day
```

여기서 `TO` 절은 결과가 전송될 위치를 나타냅니다. 즉, `up_down_votes_per_day`입니다.

이전 삽입으로부터 우리의 `votes` 테이블을 다시 채울 수 있습니다:

```sql
INSERT INTO votes SELECT toUInt32(Id) AS Id, toInt32(PostId) AS PostId, VoteTypeId, CreationDate, UserId, BountyAmount
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/*.parquet')

0 rows in set. Elapsed: 111.964 sec. Processed 477.97 million rows, 3.89 GB (4.27 million rows/s., 34.71 MB/s.)
Peak memory usage: 283.49 MiB.
```

완료되면 우리의 `up_down_votes_per_day`의 크기를 확인할 수 있습니다 - 하루에 대해 1행이 있어야 합니다:

```sql
SELECT count()
FROM up_down_votes_per_day
FINAL

┌─count()─┐
│    5723 │
└─────────┘
```

결과적으로 우리는 238백만( `votes`) 행에서 5000 행으로 행 수를 효과적으로 줄였습니다. 그러나 여기서 핵심은 새로운 투표가 `votes` 테이블에 삽입되면 새로운 값이 해당 날짜의 `up_down_votes_per_day`에 전송되어 자동으로 백그라운드에서 병합되며 하루에 대해 1행만 유지된다는 것입니다. 따라서 `up_down_votes_per_day`는 항상 작고 최신 상태로 유지됩니다.

행의 병합이 비동기적이므로 사용자가 쿼리할 때 하루에 여러 개의 투표가 있을 수 있습니다. 쿼리 시간에 모든 미비된 행이 병합되도록 하려면 두 가지 옵션이 있습니다:

- 테이블 이름에 `FINAL` 수식어를 사용합니다. 우리는 위의 카운트 쿼리에서 이것을 사용했습니다.
- 최종 테이블에서 사용된 정렬 키인 `CreationDate`로 집계하고 메트릭을 합산합니다. 일반적으로 이것이 더 효율적이고 유연하지만(테이블이 다른 용도로 사용될 수 있음), 이전 방법은 일부 쿼리에서는 더 간단할 수 있습니다. 두 가지 방법을 모두 아래에 보여줍니다:

```sql
SELECT
        Day,
        UpVotes,
        DownVotes
FROM up_down_votes_per_day
FINAL
ORDER BY Day ASC
LIMIT 10

10 rows in set. Elapsed: 0.004 sec. Processed 8.97 thousand rows, 89.68 KB (2.09 million rows/s., 20.89 MB/s.)
Peak memory usage: 289.75 KiB.

SELECT Day, sum(UpVotes) AS UpVotes, sum(DownVotes) AS DownVotes
FROM up_down_votes_per_day
GROUP BY Day
ORDER BY Day ASC
LIMIT 10
┌────────Day─┬─UpVotes─┬─DownVotes─┐
│ 2008-07-31 │       6 │         0 │
│ 2008-08-01 │     182 │        50 │
│ 2008-08-02 │     436 │       107 │
│ 2008-08-03 │     564 │       100 │
│ 2008-08-04 │    1306 │       259 │
│ 2008-08-05 │    1368 │       269 │
│ 2008-08-06 │    1701 │       211 │
│ 2008-08-07 │    1544 │       211 │
│ 2008-08-08 │    1241 │       212 │
│ 2008-08-09 │     576 │        46 │
└────────────┴─────────┴───────────┘

10 rows in set. Elapsed: 0.010 sec. Processed 8.97 thousand rows, 89.68 KB (907.32 thousand rows/s., 9.07 MB/s.)
Peak memory usage: 567.61 KiB.
```

이것은 우리의 쿼리 속도를 0.133초에서 0.004초로 단축했습니다 - 25배 이상의 개선입니다!

:::important 중요: `ORDER BY` = `GROUP BY`
대부분의 경우 물리화된 뷰 변환의 `GROUP BY` 절에 사용되는 열은 `SummingMergeTree` 또는 `AggregatingMergeTree` 테이블 엔진의 대상 테이블에서 `ORDER BY` 절에 사용되는 열과 일치해야 합니다. 이 엔진들은 백그라운드 병합 작업 중에 동일한 값의 행을 병합하는 데 `ORDER BY` 열에 의존합니다. `GROUP BY`와 `ORDER BY` 열 간의 불일치는 비효율적인 쿼리 성능, 최적이 아닌 병합 또는 데이터 불일치를 초래할 수 있습니다.
:::

### A more complex example {#a-more-complex-example}

위의 예는 매일 두 개의 합계를 계산하고 유지하기 위해 물리화된 뷰를 사용합니다. 합계는 기존 값에 새 값을 추가할 수 있기 때문에 부분 상태를 유지하기 위한 가장 간단한 집계 형태입니다. 그러나 ClickHouse의 물리화된 뷰는 모든 종류의 집계에 사용할 수 있습니다.

하루마다 게시물에 대한 통계, 즉 `Score`의 99.9 번째 백분위수와 `CommentCount`의 평균을 계산하고 싶다고 가정해 보겠습니다. 이 쿼리는 다음과 같을 수 있습니다:

```sql
SELECT
        toStartOfDay(CreationDate) AS Day,
        quantile(0.999)(Score) AS Score_99th,
        avg(CommentCount) AS AvgCommentCount
FROM posts
GROUP BY Day
ORDER BY Day DESC
LIMIT 10

┌─────────────────Day─┬────────Score_99th─┬────AvgCommentCount─┐
│ 2024-03-31 00:00:00 │  5.23700000000008 │ 1.3429811866859624 │
│ 2024-03-30 00:00:00 │                 5 │ 1.3097158891616976 │
│ 2024-03-29 00:00:00 │  5.78899999999976 │ 1.2827635327635327 │
│ 2024-03-28 00:00:00 │                 7 │  1.277746158224246 │
│ 2024-03-27 00:00:00 │ 5.738999999999578 │ 1.2113264918282023 │
│ 2024-03-26 00:00:00 │                 6 │ 1.3097536945812809 │
│ 2024-03-25 00:00:00 │                 6 │ 1.2836721018539201 │
│ 2024-03-24 00:00:00 │ 5.278999999999996 │ 1.2931667891256429 │
│ 2024-03-23 00:00:00 │ 6.253000000000156 │  1.334061135371179 │
│ 2024-03-22 00:00:00 │ 9.310999999999694 │ 1.2388059701492538 │
└─────────────────────┴───────────────────┴────────────────────┘

10 rows in set. Elapsed: 0.113 sec. Processed 59.82 million rows, 777.65 MB (528.48 million rows/s., 6.87 GB/s.)
Peak memory usage: 658.84 MiB.
```

앞서와 같이, 우리는 새 게시물이 `posts` 테이블에 삽입될 때 위의 쿼리를 실행하는 물리화된 뷰를 생성할 수 있습니다.

예시의 목적을 위해, 및 S3에서 게시물 데이터를 로드하는 것을 피하기 위해 `posts`와 동일한 스키마를 가진 중복 테이블 `posts_null`을 생성하겠습니다. 그러나 이 테이블은 어떤 데이터도 저장하지 않으며 단순히 행이 삽입될 때 물리화된 뷰에 의해 사용됩니다. 데이터를 저장하지 않도록 하려면 [`Null` 테이블 엔진 유형](/engines/table-engines/special/null)을 사용할 수 있습니다.

```sql
CREATE TABLE posts_null AS posts ENGINE = Null
```

Null 테이블 엔진은 강력한 최적화입니다 - 이를 `/dev/null`이라고 생각하십시오. 우리의 물리화된 뷰는 `posts_null` 테이블이 삽입 시간에 행을 수신할 때 요약 통계를 계산하고 저장합니다 - 이는 단지 트리거 역할을 합니다. 그러나 원시 데이터는 저장되지 않습니다. 우리의 경우 원본 게시물을 저장하고 싶지만, 이 접근 방식은 원시 데이터 저장 오버헤드를 피하면서 집계를 계산하는 데 사용될 수 있습니다.

따라서 물리화된 뷰는 다음과 같이 됩니다:

```sql
CREATE MATERIALIZED VIEW post_stats_mv TO post_stats_per_day AS
       SELECT toStartOfDay(CreationDate) AS Day,
       quantileState(0.999)(Score) AS Score_quantiles,
       avgState(CommentCount) AS AvgCommentCount
FROM posts_null
GROUP BY Day
```

우리의 집계 함수 끝에 접미사 `State`를 붙이는 점에 유의하십시오. 이는 함수의 집계 상태가 최종 결과 대신 반환되도록 보장합니다. 이는 이 부분 상태가 다른 상태와 병합될 수 있도록 추가 정보를 포함합니다. 예를 들어, 평균의 경우 이 상태에는 열의 카운트와 합계가 포함됩니다.

> 부분 집계 상태는 올바른 결과를 계산하는 데 필요합니다. 예를 들어, 평균을 계산하기 위해 서브 범위의 평균을 단순히 평균 내는 것은 잘못된 결과를 생성합니다.

이제 이 뷰의 대상 테이블인 `post_stats_per_day`를 생성하여 이러한 부분 집계 상태를 저장합니다:

```sql
CREATE TABLE post_stats_per_day
(
  `Day` Date,
  `Score_quantiles` AggregateFunction(quantile(0.999), Int32),
  `AvgCommentCount` AggregateFunction(avg, UInt8)
)
ENGINE = AggregatingMergeTree
ORDER BY Day
```

이전에 `SummingMergeTree`가 카운트를 저장하는 데 충분했지만, 우리는 다른 함수에 대해 더 발전된 엔진 유형인 [`AggregatingMergeTree`](/engines/table-engines/mergetree-family/aggregatingmergetree)가 필요합니다.
ClickHouse가 집계 상태가 저장될 것임을 알리기 위해, 우리는 `Score_quantiles`와 `AvgCommentCount`를 `AggregateFunction` 유형으로 정의하여 부분 상태와 소스 열 유형을 지정합니다. `SummingMergeTree`와 마찬가지로, 동일한 `ORDER BY` 키 값이 있는 행들은 병합됩니다(위의 예에서는 `Day`).

우리의 물리화된 뷰를 통해 `post_stats_per_day`를 채우기 위해, 우리는 단순히 `posts`에서 모든 행을 `posts_null`로 삽입할 수 있습니다:

```sql
INSERT INTO posts_null SELECT * FROM posts

0 rows in set. Elapsed: 13.329 sec. Processed 119.64 million rows, 76.99 GB (8.98 million rows/s., 5.78 GB/s.)
```

> 프로덕션에서는 물리화된 뷰를 `posts` 테이블에 연결할 가능성이 높습니다. 우리는 null 테이블을 사용하여 null 테이블을 보여주기 위해 `posts_null`을 사용했습니다.

최종 쿼리는 함수에 `Merge` 접미사를 사용해야 합니다(열이 부분 집계 상태를 저장하므로):

```sql
SELECT
        Day,
        quantileMerge(0.999)(Score_quantiles),
        avgMerge(AvgCommentCount)
FROM post_stats_per_day
GROUP BY Day
ORDER BY Day DESC
LIMIT 10
```

여기서는 `FINAL`을 사용하는 대신 `GROUP BY`를 사용하는 점에 유의하십시오.

## Other applications {#other-applications}

위에서는 주로 물리화된 뷰를 사용하여 데이터의 부분 집계를 점진적으로 업데이트하여 계산을 쿼리에서 삽입 시간으로 이동시키는 데 중점을 두었습니다. 이러한 일반적인 사용 사례 외에도 물리화된 뷰는 여러 가지 다른 응용 프로그램이 있습니다.

### Filtering and transformation {#filtering-and-transformation}

일부 상황에서는 우리가 삽입할 때 행과 열의 하위 집합만 삽입하고 싶을 수 있습니다. 이 경우, 우리의 `posts_null` 테이블은 삽입 전에 행을 필터링하는 `SELECT` 쿼리로 삽입을 받을 수 있습니다. 예를 들어, 우리가 `posts` 테이블의 `Tags` 열을 변환하고 싶다고 가정해 보겠습니다. 이것은 태그 이름의 파이프 구분 목록을 포함합니다. 이를 배열로 변환하여 개별 태그 값에 따라 집계하기가 더 쉬워집니다.

> 우리는 `INSERT INTO SELECT`를 실행할 때 이 변환을 수행할 수 있습니다. 물리화된 뷰는 ClickHouse DDL에서 이 로직을 캡슐화할 수 있게 하여 우리의 `INSERT`를 간단하게 유지하고, 새 행에 이 변환이 적용되도록 할 수 있습니다.

이 변환을 위한 우리의 물리화된 뷰는 아래와 같습니다:

```sql
CREATE MATERIALIZED VIEW posts_mv TO posts AS
        SELECT * EXCEPT Tags, arrayFilter(t -> (t != ''), splitByChar('|', Tags)) as Tags FROM posts_null
```

### Lookup table {#lookup-table}

사용자는 ClickHouse 정렬 키를 선택할 때 자신의 접근 패턴을 고려해야 합니다. 필터 및 집계 절에서 자주 사용되는 열을 사용해야 합니다. 이것은 사용자가 더 다양한 접근 패턴을 가지고 있는 시나리오에서는 제한적일 수 있습니다. 예를 들어, 다음 `comments` 테이블을 고려해 보십시오:

```sql
CREATE TABLE comments
(
    `Id` UInt32,
    `PostId` UInt32,
    `Score` UInt16,
    `Text` String,
    `CreationDate` DateTime64(3, 'UTC'),
    `UserId` Int32,
    `UserDisplayName` LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY PostId

0 rows in set. Elapsed: 46.357 sec. Processed 90.38 million rows, 11.14 GB (1.95 million rows/s., 240.22 MB/s.)
```

여기서 정렬 키는 `PostId`로 필터링하는 쿼리에 최적화됩니다.

특정 `UserId`를 기반으로 필터링하고 해당 평균 `Score`를 계산하려는 사용자가 있다고 가정해 보겠습니다:

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

┌──────────avg(Score)─┐
│ 0.18181818181818182 │
└─────────────────────┘

1 row in set. Elapsed: 0.778 sec. Processed 90.38 million rows, 361.59 MB (116.16 million rows/s., 464.74 MB/s.)
Peak memory usage: 217.08 MiB.
```

빠르긴 하지만(ClickHouse에게 데이터가 작기 때문에), 처리된 행 수에서 전체 테이블 스캔이 필요하다는 것을 알 수 있습니다 - 90.38 백만. 더 큰 데이터 세트의 경우, 우리는 물리화된 뷰를 사용하여 `UserId` 열을 필터링하기 위한 정렬 키 값을 `PostId`로 조회할 수 있습니다. 이러한 값은 효율적인 조회를 수행하는 데 사용될 수 있습니다.

이 예에서 우리의 물리화된 뷰는 매우 간단하게, 삽입할 때 `comments`에서 `PostId`와 `UserId`만 선택합니다. 이러한 결과는 차례로 `UserId`로 정렬된 `comments_posts_users` 테이블로 전송됩니다. 아래에서 `Comments` 테이블의 null 버전을 작성하고 이것을 사용하여 우리 뷰와 `comments_posts_users` 테이블을 채웁니다:

```sql
CREATE TABLE comments_posts_users (
  PostId UInt32,
  UserId Int32
) ENGINE = MergeTree ORDER BY UserId

CREATE TABLE comments_null AS comments
ENGINE = Null

CREATE MATERIALIZED VIEW comments_posts_users_mv TO comments_posts_users AS
SELECT PostId, UserId FROM comments_null

INSERT INTO comments_null SELECT * FROM comments

0 rows in set. Elapsed: 5.163 sec. Processed 90.38 million rows, 17.25 GB (17.51 million rows/s., 3.34 GB/s.)
```

이제 이 뷰를 서브쿼리에서 사용하여 이전 쿼리를 가속화할 수 있습니다:

```sql
SELECT avg(Score)
FROM comments
WHERE PostId IN (
        SELECT PostId
        FROM comments_posts_users
        WHERE UserId = 8592047
) AND UserId = 8592047

┌──────────avg(Score)─┐
│ 0.18181818181818182 │
└─────────────────────┘

1 row in set. Elapsed: 0.012 sec. Processed 88.61 thousand rows, 771.37 KB (7.09 million rows/s., 61.73 MB/s.)
```

### Chaining / cascading materialized views {#chaining}

물리화된 뷰는 체인(또는 계단식 연결)이 가능하여 복잡한 워크플로를 설정할 수 있게 합니다. 자세한 내용은 ["Cascading materialized views"](https://clickhouse.com/docs/guides/developer/cascading-materialized-views) 가이드를 참조하십시오.

## Materialized views and JOINs {#materialized-views-and-joins}

:::note Refreshable Materialized Views
다음 내용은 증분 물리화된 뷰에만 해당합니다. 새로 고칠 수 있는 물리화된 뷰는 정기적으로 전체 대상 데이터 세트에 대해 쿼리를 실행하며 JOIN을 완전히 지원합니다. 결과 신선도가 감소하더라도 복잡한 JOIN에 대해 이들을 사용하는 것을 고려하십시오.
:::

ClickHouse의 증분 물리화된 뷰는 `JOIN` 작업을 완전히 지원하지만 한 가지 중요한 제약이 있습니다: **물리화된 뷰는 소스 테이블(쿼리에서 가장 왼쪽 테이블)에 삽입될 때만 트리거됩니다.** JOIN의 오른쪽 테이블은 데이터가 변경되더라도 업데이트를 트리거하지 않습니다. 이 동작은 **증분** 물리화된 뷰를 구축할 때 특히 중요하며, 데이터가 삽입 시간에 집계되거나 변환됩니다.

증분 물리화된 뷰가 `JOIN`을 사용하여 정의되면, `SELECT` 쿼리의 가장 왼쪽 테이블이 소스 역할을 합니다. 이 테이블에 새 행이 삽입되면 ClickHouse는 물리화된 뷰 쿼리를 **오직** 새로 삽입된 행만 사용하여 실행합니다. JOIN의 오른쪽 테이블은 이 실행 중 전체적으로 읽히지만 그들만의 변경 사항으로는 뷰를 트리거하지 않습니다.

이 동작은 물리화된 뷰의 JOIN을 정적 차원 데이터에 대한 스냅샷 JOIN과 유사하게 만듭니다.

이것은 참조 또는 차원 테이블로 데이터를 풍부하게 만드는 데 잘 작동합니다. 그러나 오른쪽 테이블(예: 사용자 메타데이터)에 대한 모든 업데이트는 물리화된 뷰를 소급적으로 업데이트하지 않습니다. 업데이트된 데이터를 보려면 소스 테이블에 새 삽입이 필요합니다.

### Example {#materialized-views-and-joins-example}

[Stack Overflow 데이터 세트](/data-modeling/schema-design)를 사용하여 **사용자별 일일 배지**를 계산하는 물리화된 뷰의 구체적인 예를 살펴보겠습니다. 이는 `users` 테이블에서 사용자의 표시 이름을 포함합니다.

테이블 스키마는 다음과 같습니다:

```sql
CREATE TABLE badges
(
    `Id` UInt32,
    `UserId` Int32,
    `Name` LowCardinality(String),
    `Date` DateTime64(3, 'UTC'),
    `Class` Enum8('Gold' = 1, 'Silver' = 2, 'Bronze' = 3),
    `TagBased` Bool
)
ENGINE = MergeTree
ORDER BY UserId

CREATE TABLE users
(
    `Id` Int32,
    `Reputation` UInt32,
    `CreationDate` DateTime64(3, 'UTC'),
    `DisplayName` LowCardinality(String),
    `LastAccessDate` DateTime64(3, 'UTC'),
    `Location` LowCardinality(String),
    `Views` UInt32,
    `UpVotes` UInt32,
    `DownVotes` UInt32
)
ENGINE = MergeTree
ORDER BY Id;
```

`users` 테이블에 미리 데이터가 채워져 있다고 가정해 보겠습니다:

```sql
INSERT INTO users
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/users.parquet');
```

물리화된 뷰와 관련된 대상 테이블은 다음과 같이 정의됩니다:

```sql
CREATE TABLE daily_badges_by_user
(
    Day Date,
    UserId Int32,
    DisplayName LowCardinality(String),
    Gold UInt32,
    Silver UInt32,
    Bronze UInt32
)
ENGINE = SummingMergeTree
ORDER BY (DisplayName, UserId, Day);

CREATE MATERIALIZED VIEW daily_badges_by_user_mv TO daily_badges_by_user AS
SELECT
    toDate(Date) AS Day,
    b.UserId,
    u.DisplayName,
    countIf(Class = 'Gold') AS Gold,
    countIf(Class = 'Silver') AS Silver,
    countIf(Class = 'Bronze') AS Bronze
FROM badges AS b
LEFT JOIN users AS u ON b.UserId = u.Id
GROUP BY Day, b.UserId, u.DisplayName;
```

:::note Grouping and Ordering Alignment
물리화된 뷰의 `GROUP BY` 절에는 `DisplayName`, `UserId`, 및 `Day`가 포함되어 `SummingMergeTree` 대상 테이블의 `ORDER BY`와 일치해야 합니다. 이는 행이 올바르게 집계되고 병합되도록 보장합니다. 이 중 어느 것을 생략하면 잘못된 결과나 비효율적인 병합이 발생할 수 있습니다.
:::

이제 배지를 채우면 뷰가 트리거되어 우리의 `daily_badges_by_user` 테이블이 채워집니다.

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 433.762 sec. Processed 1.16 billion rows, 28.50 GB (2.67 million rows/s., 65.70 MB/s.)
```

특정 사용자가 달성한 배지를 보려면 다음 쿼리를 작성할 수 있습니다:

```sql
SELECT *
FROM daily_badges_by_user
FINAL
WHERE DisplayName = 'gingerwizard'

┌────────Day─┬──UserId─┬─DisplayName──┬─Gold─┬─Silver─┬─Bronze─┐
│ 2023-02-27 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2023-02-28 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2013-10-30 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2024-03-04 │ 2936484 │ gingerwizard │    0 │      1 │      0 │
│ 2024-03-05 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2023-04-17 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2013-11-18 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2023-10-31 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
└────────────┴─────────┴──────────────┴──────┴────────┴────────┘

8 rows in set. Elapsed: 0.018 sec. Processed 32.77 thousand rows, 642.14 KB (1.86 million rows/s., 36.44 MB/s.)
```

이 사용자가 새 배지를 받으면 행이 삽입되고, 우리의 뷰가 업데이트됩니다:

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 7.517 sec.

SELECT *
FROM daily_badges_by_user
FINAL
WHERE DisplayName = 'gingerwizard'
┌────────Day─┬──UserId─┬─DisplayName──┬─Gold─┬─Silver─┬─Bronze─┐
│ 2013-10-30 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2013-11-18 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2023-02-27 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2023-02-28 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2023-04-17 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2023-10-31 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2024-03-04 │ 2936484 │ gingerwizard │    0 │      1 │      0 │
│ 2024-03-05 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2025-04-13 │ 2936484 │ gingerwizard │    1 │      0 │      0 │
└────────────┴─────────┴──────────────┴──────┴────────┴────────┘

9 rows in set. Elapsed: 0.017 sec. Processed 32.77 thousand rows, 642.27 KB (1.96 million rows/s., 38.50 MB/s.)
```

:::warning
여기서 삽입의 대기 시간에 주의하십시오. 삽입된 사용자 행이 전체 `users` 테이블과 조인되며, 이는 삽입 성능에 상당한 영향을 미칩니다. 우리는 ["Using source table in filters and joins"](/materialized-view/incremental-materialized-view#using-source-table-in-filters-and-joins-in-materialized-views)에서 이를 해결할 수 있는 방법을 제안합니다.
:::

반대로, 새 사용자에 대한 배지를 삽입한 후 사용자의 행이 삽입되면, 우리의 물리화된 뷰는 사용자의 메트릭을 캡처하는 데 실패합니다.

```sql
INSERT INTO badges VALUES (53505059, 23923286, 'Good Answer', now(), 'Bronze', 0);
INSERT INTO users VALUES (23923286, 1, now(),  'brand_new_user', now(), 'UK', 1, 1, 0);
```

```sql
SELECT *
FROM daily_badges_by_user
FINAL
WHERE DisplayName = 'brand_new_user';

0 rows in set. Elapsed: 0.017 sec. Processed 32.77 thousand rows, 644.32 KB (1.98 million rows/s., 38.94 MB/s.)
```

이 경우 뷰는 배지 삽입에 대해서만 실행되고, 사용자 행이 존재하기 전에 실행됩니다. 사용자를 위한 또 다른 배지를 삽입하면 행이 삽입됩니다. 예상되는 대로입니다:

```sql
INSERT INTO badges VALUES (53505060, 23923286, 'Teacher', now(), 'Bronze', 0);

SELECT *
FROM daily_badges_by_user
FINAL
WHERE DisplayName = 'brand_new_user'

┌────────Day─┬───UserId─┬─DisplayName────┬─Gold─┬─Silver─┬─Bronze─┐
│ 2025-04-13 │ 23923286 │ brand_new_user │    0 │      0 │      1 │
└────────────┴──────────┴────────────────┴──────┴────────┴────────┘

1 row in set. Elapsed: 0.018 sec. Processed 32.77 thousand rows, 644.48 KB (1.87 million rows/s., 36.72 MB/s.)
```

그러나 이 결과는 올바르지 않다는 점에 주의하십시오.

### Best practices for JOINs in materialized views {#join-best-practices}

- **가장 왼쪽 테이블을 트리거로 사용하세요.** `SELECT` 문에서 왼쪽에 있는 테이블만 물리화된 뷰를 트리거합니다. 오른쪽 테이블에 대한 변경 사항은 업데이트를 트리거하지 않습니다.

- **JOIN된 데이터 미리 삽입하십시오.** 소스 테이블에 대한 행을 삽입하기 전에 JOIN된 테이블의 데이터가 존재하는지 확인하세요. JOIN은 삽입 시간에 평가되므로 누락되는 데이터는 일치하지 않는 행이나 null을 초래합니다.

- **JOIN에서 가져오는 열을 제한하십시오.** JOIN된 테이블에서 꼭 필요한 열만 선택하여 메모리 사용을 최소화하고 삽입 시간 대기 시간을 줄이도록 하십시오(아래 참조).

- **삽입 시간 성능을 평가하십시오.** JOIN은 삽입 비용을 증가시킵니다, 특히 큰 오른쪽 테이블이 있는 경우에. 대표적인 프로덕션 데이터를 사용하여 삽입 속도를 벤치마킹하세요.

- **간단한 조회에는 사전(Dictionaries)을 선호하세요.** 사용자 ID에서 이름으로의 키-값 조회에는 [Dictionaries](/dictionary)를 사용하여 비용이 많이 드는 JOIN 작업을 피하세요.

- **병합 효율성을 위해 `GROUP BY` 및 `ORDER BY`를 정렬하세요.** `SummingMergeTree` 또는 `AggregatingMergeTree`를 사용할 경우, `GROUP BY`가 대상 테이블의 `ORDER BY` 절과 일치하도록 하여 행 병합을 효율적으로 할 수 있도록 하십시오.

- **명시적 열 별칭을 사용하세요.** 테이블에 중복되는 열 이름이 있을 경우, 별칭을 사용하여 모호성을 피하고 대상 테이블에서 올바른 결과를 보장하세요.

- **삽입량 및 빈도를 고려하세요.** JOIN은 중간 삽입 작업에 잘 작동합니다. 높은 처리량 흡입의 경우, 단계 테이블, 사전 JOIN 또는 [Refreshable Materialized Views](/materialized-view/refreshable-materialized-view)와 같은 다른 접근 방식을 사용하는 것을 고려하세요.

### Using source table in filters and joins {#using-source-table-in-filters-and-joins-in-materialized-views}

ClickHouse에서 물리화된 뷰를 작업할 때, 물리화된 뷰 쿼리의 실행 중 소스 테이블이 어떻게 처리되는지 이해하는 것이 중요합니다. 구체적으로, 물리화된 뷰 쿼리의 소스 테이블은 삽입된 데이터 블록으로 대체됩니다. 이 동작은 잘못 이해될 경우 예상치 못한 결과를 초래할 수 있습니다.

#### Example scenario {#example-scenario}

다음과 같은 설정을 고려해 보십시오:

```sql
CREATE TABLE t0 (`c0` Int) ENGINE = Memory;
CREATE TABLE mvw1_inner (`c0` Int) ENGINE = Memory;
CREATE TABLE mvw2_inner (`c0` Int) ENGINE = Memory;

CREATE VIEW vt0 AS SELECT * FROM t0;

CREATE MATERIALIZED VIEW mvw1 TO mvw1_inner
AS SELECT count(*) AS c0
    FROM t0
    LEFT JOIN ( SELECT * FROM t0 ) AS x ON t0.c0 = x.c0;

CREATE MATERIALIZED VIEW mvw2 TO mvw2_inner
AS SELECT count(*) AS c0
    FROM t0
    LEFT JOIN vt0 ON t0.c0 = vt0.c0;

INSERT INTO t0 VALUES (1),(2),(3);

INSERT INTO t0 VALUES (1),(2),(3),(4),(5);

SELECT * FROM mvw1;
┌─c0─┐
│  3 │
│  5 │
└────┘

SELECT * FROM mvw2;
┌─c0─┐
│  3 │
│  8 │
└────┘
```

#### Explanation {#explanation}

위의 예에서는 유사한 작업을 수행하지만 소스 테이블 `t0`에 대한 참조 방식이 약간 다른 두 개의 물리화된 뷰 `mvw1` 및 `mvw2`가 있습니다.

`mvw1`에서 테이블 `t0`는 JOIN의 오른쪽에 있는 `(SELECT * FROM t0)` 서브쿼리 내에서 직접 참조됩니다. 데이터가 `t0`에 삽입되면 물리화된 뷰의 쿼리는 삽입된 데이터 블록이 `t0`를 대체하여执行됩니다. 이는 JOIN 작업이 전체 테이블이 아니라 새로 삽입된 행에서만 수행됨을 의미합니다.

두 번째 경우 `vt0`를 JOIN하는 경우에는 뷰가 `t0`에서 모든 데이터를 읽습니다. 이는 JOIN 작업이 `t0`에서 모든 행을 고려하도록 합니다. 새로 삽입된 블록만이 아니라는 것이 중요합니다.

ClickHouse가 물리화된 뷰의 쿼리에서 소스 테이블을 처리하는 방식에서 핵심적인 차이가 있습니다. 물리화된 뷰가 삽입으로 트리거되면 소스 테이블(`t0`인 경우)은 삽입된 데이터 블록으로 대체됩니다. 이 동작은 쿼리를 최적화하는 데 활용할 수 있지만, 예상치 못한 결과를 피하기 위해 신중하게 고려해야 합니다.

### Use cases and caveats {#use-cases-and-caveats}

실제로 이 동작은 소스 테이블 데이터의 하위 집합을 처리하는 물리화된 뷰를 최적화하는 데 사용할 수 있습니다. 예를 들어, 소스 테이블을 JOIN하기 전에 소스 테이블을 필터링하는 서브쿼리를 사용할 수 있습니다. 이는 물리화된 뷰에서 처리되는 데이터 양을 줄이고 성능을 개선할 수 있습니다.

```sql
CREATE TABLE t0 (id UInt32, value String) ENGINE = MergeTree() ORDER BY id;
CREATE TABLE t1 (id UInt32, description String) ENGINE = MergeTree() ORDER BY id;
INSERT INTO t1 VALUES (1, 'A'), (2, 'B'), (3, 'C');

CREATE TABLE mvw1_target_table (id UInt32, value String, description String) ENGINE = MergeTree() ORDER BY id;

CREATE MATERIALIZED VIEW mvw1 TO mvw1_target_table AS
SELECT t0.id, t0.value, t1.description
FROM t0
JOIN (SELECT * FROM t1 WHERE t1.id IN (SELECT id FROM t0)) AS t1
ON t0.id = t1.id;
```

이 예에서 `IN (SELECT id FROM t0)` 서브쿼리에서 생성된 집합은 새로 삽입된 행만 가지고 있으며, 이는 `t1`을 필터링하는 데 도움을 줄 수 있습니다.

#### Example with stack overflow {#example-with-stack-overflow}

우리가 [이전의 물리화된 뷰 예](/materialized-view/incremental-materialized-view#example)를 고려하여 **사용자별 일일 배지**를 계산하는 예로 돌아가 보겠습니다. 여기에는 사용자의 표시 이름이 `users` 테이블에서 포함됩니다.

```sql
CREATE MATERIALIZED VIEW daily_badges_by_user_mv TO daily_badges_by_user
AS SELECT
    toDate(Date) AS Day,
    b.UserId,
    u.DisplayName,
    countIf(Class = 'Gold') AS Gold,
    countIf(Class = 'Silver') AS Silver,
    countIf(Class = 'Bronze') AS Bronze
FROM badges AS b
LEFT JOIN users AS u ON b.UserId = u.Id
GROUP BY Day, b.UserId, u.DisplayName;
```

이 뷰는 `badges` 테이블에 대한 삽입 지연에 상당한 영향을 미쳤습니다. 예를 들어:

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 7.517 sec.
```

위의 접근 방식을 사용하여 우리는 이 뷰를 최적화할 수 있습니다. 삽입된 배지 행의 사용자 ID를 사용하여 `users` 테이블에 필터를 추가합니다:

```sql
CREATE MATERIALIZED VIEW daily_badges_by_user_mv TO daily_badges_by_user
AS SELECT
    toDate(Date) AS Day,
    b.UserId,
    u.DisplayName,
    countIf(Class = 'Gold') AS Gold,
    countIf(Class = 'Silver') AS Silver,
    countIf(Class = 'Bronze') AS Bronze
FROM badges AS b
LEFT JOIN
(
    SELECT
        Id,
        DisplayName
    FROM users
    WHERE Id IN (
        SELECT UserId
        FROM badges
    )
) AS u ON b.UserId = u.Id
GROUP BY
    Day,
    b.UserId,
    u.DisplayName
```

이는 초기에 배지를 삽입하는 속도를 높여줄 뿐만 아니라:

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 132.118 sec. Processed 323.43 million rows, 4.69 GB (2.45 million rows/s., 35.49 MB/s.)
Peak memory usage: 1.99 GiB.
```

미래 배지 삽입이 효율적이게 만들어 줍니다:

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 0.583 sec.
```

위의 작업에서 사용자 ID `2936484`에 대해 users 테이블에서 행이 단 한 번 가져와집니다. 이 조회는 `Id`의 테이블 정렬 키로 최적화됩니다.

## Materialized views and unions {#materialized-views-and-unions}

`UNION ALL` 쿼리는 여러 소스 테이블의 데이터를 단일 결과 세트로 결합하는 데 일반적으로 사용됩니다.

`UNION ALL`은 증분 물리화된 뷰에서 직접 지원되지는 않지만, 각 `SELECT` 분기에 대해 별도의 물리화된 뷰를 생성하고 그 결과를 공유 대상 테이블에 작성하여 동일한 결과를 얻을 수 있습니다.

우리의 예에서는 Stack Overflow 데이터 세트를 사용할 것입니다. 사용자에 의해 얻어진 배지와 게시물에 대한 댓글을 나타내는 아래의 `badges` 및 `comments` 테이블을 고려해 보십시오:

```sql
CREATE TABLE stackoverflow.comments
(
    `Id` UInt32,
    `PostId` UInt32,
    `Score` UInt16,
    `Text` String,
    `CreationDate` DateTime64(3, 'UTC'),
    `UserId` Int32,
    `UserDisplayName` LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY CreationDate

CREATE TABLE stackoverflow.badges
(
    `Id` UInt32,
    `UserId` Int32,
    `Name` LowCardinality(String),
    `Date` DateTime64(3, 'UTC'),
    `Class` Enum8('Gold' = 1, 'Silver' = 2, 'Bronze' = 3),
    `TagBased` Bool
)
ENGINE = MergeTree
ORDER BY UserId
```

이는 다음 `INSERT INTO` 명령으로 채워질 수 있습니다:

```sql
INSERT INTO stackoverflow.badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')
INSERT INTO stackoverflow.comments SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/comments/*.parquet')
```

사용자 활동의 통합 뷰를 생성하여 다음 두 테이블을 결합하려 한다고 가정해 보겠습니다:

```sql
SELECT
 UserId,
 argMax(description, event_time) AS last_description,
 argMax(activity_type, event_time) AS activity_type,
    max(event_time) AS last_activity
FROM
(
    SELECT
 UserId,
 CreationDate AS event_time,
        Text AS description,
        'comment' AS activity_type
    FROM stackoverflow.comments
    UNION ALL
    SELECT
 UserId,
        Date AS event_time,
        Name AS description,
        'badge' AS activity_type
    FROM stackoverflow.badges
)
GROUP BY UserId
ORDER BY last_activity DESC
LIMIT 10
```

이 쿼리의 결과를 수신할 대상 테이블이 있다고 가정해 보겠습니다. 여기서 [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) 테이블 엔진과 [AggregateFunction](/sql-reference/data-types/aggregatefunction)을 사용하여 결과가 올바르게 병합되도록 합니다:

```sql
CREATE TABLE user_activity
(
    `UserId` String,
    `last_description` AggregateFunction(argMax, String, DateTime64(3, 'UTC')),
    `activity_type` AggregateFunction(argMax, String, DateTime64(3, 'UTC')),
    `last_activity` SimpleAggregateFunction(max, DateTime64(3, 'UTC'))
)
ENGINE = AggregatingMergeTree
ORDER BY UserId
```

이 테이블을 `badges` 또는 `comments` 중 어느 하나에 새 행이 삽입될 때 업데이트되도록 하려면, 이 문제에 대한 단순한 접근은 이전의 union 쿼리를 사용하여 물리화된 뷰를 만드는 것입니다:

```sql
CREATE MATERIALIZED VIEW user_activity_mv TO user_activity AS
SELECT
 UserId,
 argMaxState(description, event_time) AS last_description,
 argMaxState(activity_type, event_time) AS activity_type,
    max(event_time) AS last_activity
FROM
(
    SELECT
 UserId,
 CreationDate AS event_time,
        Text AS description,
        'comment' AS activity_type
    FROM stackoverflow.comments
    UNION ALL
    SELECT
 UserId,
        Date AS event_time,
        Name AS description,
        'badge' AS activity_type
    FROM stackoverflow.badges
)
GROUP BY UserId
ORDER BY last_activity DESC
```

이는 문법적으로 유효하지만, 의도하지 않은 결과를 초래합니다 - 뷰는 `comments` 테이블에 대한 삽입만 트리거합니다. 예를 들어:

```sql
INSERT INTO comments VALUES (99999999, 23121, 1, 'The answer is 42', now(), 2936484, 'gingerwizard');

SELECT
 UserId,
 argMaxMerge(last_description) AS description,
 argMaxMerge(activity_type) AS activity_type,
    max(last_activity) AS last_activity
FROM user_activity
WHERE UserId = '2936484'
GROUP BY UserId

┌─UserId──┬─description──────┬─activity_type─┬───────────last_activity─┐
│ 2936484 │ The answer is 42 │ comment       │ 2025-04-15 09:56:19.000 │
└─────────┴──────────────────┴───────────────┴─────────────────────────┘

1 row in set. Elapsed: 0.005 sec.
```

`badges` 테이블에 삽입은 뷰를 트리거하지 않으며, `user_activity`는 업데이트를 받지 않습니다:

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

SELECT
 UserId,
 argMaxMerge(last_description) AS description,
 argMaxMerge(activity_type) AS activity_type,
    max(last_activity) AS last_activity
FROM user_activity
WHERE UserId = '2936484'
GROUP BY UserId;

┌─UserId──┬─description──────┬─activity_type─┬───────────last_activity─┐
│ 2936484 │ The answer is 42 │ comment       │ 2025-04-15 09:56:19.000 │
└─────────┴──────────────────┴───────────────┴─────────────────────────┘

1 row in set. Elapsed: 0.005 sec.
```

이를 해결하기 위해 각 SELECT 문에 대해 물리화된 뷰를 생성합니다:

```sql
DROP TABLE user_activity_mv;
TRUNCATE TABLE user_activity;

CREATE MATERIALIZED VIEW comment_activity_mv TO user_activity AS
SELECT
 UserId,
 argMaxState(Text, CreationDate) AS last_description,
 argMaxState('comment', CreationDate) AS activity_type,
    max(CreationDate) AS last_activity
FROM stackoverflow.comments
GROUP BY UserId;

CREATE MATERIALIZED VIEW badges_activity_mv TO user_activity AS
SELECT
 UserId,
 argMaxState(Name, Date) AS last_description,
 argMaxState('badge', Date) AS activity_type,
    max(Date) AS last_activity
FROM stackoverflow.badges
GROUP BY UserId;
```

이제 어느 테이블에 삽입하든 올바른 결과를 얻게 됩니다. 예를 들어, `comments` 테이블에 삽입하면:

```sql
INSERT INTO comments VALUES (99999999, 23121, 1, 'The answer is 42', now(), 2936484, 'gingerwizard');

SELECT
 UserId,
 argMaxMerge(last_description) AS description,
 argMaxMerge(activity_type) AS activity_type,
    max(last_activity) AS last_activity
FROM user_activity
WHERE UserId = '2936484'
GROUP BY UserId;

┌─UserId──┬─description──────┬─activity_type─┬───────────last_activity─┐
│ 2936484 │ The answer is 42 │ comment       │ 2025-04-15 10:18:47.000 │
└─────────┴──────────────────┴───────────────┴─────────────────────────┘

1 row in set. Elapsed: 0.006 sec.
```

마찬가지로 `badges` 테이블에 삽입은 `user_activity` 테이블에 반영됩니다:

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

SELECT
 UserId,
 argMaxMerge(last_description) AS description,
 argMaxMerge(activity_type) AS activity_type,
    max(last_activity) AS last_activity
FROM user_activity
WHERE UserId = '2936484'
GROUP BY UserId

┌─UserId──┬─description──┬─activity_type─┬───────────last_activity─┐
│ 2936484 │ gingerwizard │ badge         │ 2025-04-15 10:20:18.000 │
└─────────┴──────────────┴───────────────┴─────────────────────────┘

1 row in set. Elapsed: 0.006 sec.
```

## Parallel vs sequential processing {#materialized-views-parallel-vs-sequential}

이전 예제에서 보여준 것처럼, 한 테이블은 여러 물리화된 뷰의 소스 역할을 할 수 있습니다. 이러한 뷰가 실행되는 순서는 설정 [`parallel_view_processing`](/operations/settings/settings#parallel_view_processing)에 따라 다릅니다.

기본적으로 이 설정은 `0`(`false`)으로 설정되어 있어 물리화된 뷰가 `uuid` 순서로 순차적으로 실행됩니다.

예를 들어, 다음 `source` 테이블과 각기 다른 `target` 테이블로 행을 보내는 3개의 물리화된 뷰를 고려해 보십시오:

```sql
CREATE TABLE source
(
    `message` String
)
ENGINE = MergeTree
ORDER BY tuple();

CREATE TABLE target
(
    `message` String,
    `from` String,
    `now` DateTime64(9),
    `sleep` UInt8
)
ENGINE = MergeTree
ORDER BY tuple();

CREATE MATERIALIZED VIEW mv_2 TO target
AS SELECT
    message,
    'mv2' AS from,
    now64(9) as now,
    sleep(1) as sleep
FROM source;

CREATE MATERIALIZED VIEW mv_3 TO target
AS SELECT
    message,
    'mv3' AS from,
    now64(9) as now,
    sleep(1) as sleep
FROM source;

CREATE MATERIALIZED VIEW mv_1 TO target
AS SELECT
    message,
    'mv1' AS from,
    now64(9) as now,
    sleep(1) as sleep
FROM source;
```

각 뷰는 `target` 테이블에 행을 삽입하기 전에 1초 동안 일시 중지합니다. 이와 함께 자신의 이름과 삽입 시간을 포함합니다.

테이블 `source`에 행을 삽입하는 데는 약 3초가 소요되며, 각 뷰가 순차적으로 실행됩니다:

```sql
INSERT INTO source VALUES ('test')

1 row in set. Elapsed: 3.786 sec.
```

각 행의 도착을 `SELECT`으로 확인할 수 있습니다:

```sql
SELECT
    message,
    from,
    now
FROM target
ORDER BY now ASC

┌─message─┬─from─┬───────────────────────────now─┐
│ test    │ mv3  │ 2025-04-15 14:52:01.306162309 │
│ test    │ mv1  │ 2025-04-15 14:52:02.307693521 │
│ test    │ mv2  │ 2025-04-15 14:52:03.309250283 │
└─────────┴──────┴───────────────────────────────┘

3 rows in set. Elapsed: 0.015 sec.
```

이는 뷰의 `uuid`와 일치합니다:

```sql
SELECT
    name,
 uuid
FROM system.tables
WHERE name IN ('mv_1', 'mv_2', 'mv_3')
ORDER BY uuid ASC

┌─name─┬─uuid─────────────────────────────────┐
│ mv_3 │ ba5e36d0-fa9e-4fe8-8f8c-bc4f72324111 │
│ mv_1 │ b961c3ac-5a0e-4117-ab71-baa585824d43 │
│ mv_2 │ e611cc31-70e5-499b-adcc-53fb12b109f5 │
└──────┴──────────────────────────────────────┘

3 rows in set. Elapsed: 0.004 sec.
```

반대로 `parallel_view_processing=1`이 활성화된 경우 삽입된 행은 어떻게 되는지 생각해보십시오. 이를 활성화하면, 뷰가 병렬로 실행되며 대상 테이블에 행이 도착하는 순서를 보장하지 않습니다:

```sql
TRUNCATE target;
SET parallel_view_processing = 1;

INSERT INTO source VALUES ('test');

1 row in set. Elapsed: 1.588 sec.

SELECT
    message,
    from,
    now
FROM target
ORDER BY now ASC

┌─message─┬─from─┬───────────────────────────now─┐
│ test    │ mv3  │ 2025-04-15 19:47:32.242937372 │
│ test    │ mv1  │ 2025-04-15 19:47:32.243058183 │
│ test    │ mv2  │ 2025-04-15 19:47:32.337921800 │
└─────────┴──────┴───────────────────────────────┘

3 rows in set. Elapsed: 0.004 sec.
```

각 뷰에서 도착하는 행의 순서는 동일하지만, 이는 보장이 되지 않습니다 - 각 행의 삽입 시간이 유사하다는 점에서도 확인할 수 있습니다. 또한 삽입 성능이 개선되었음을 주목하십시오.

### When to use parallel processing {#materialized-views-when-to-use-parallel}

`parallel_view_processing=1`을 활성화하면 삽입 처리량이 크게 향상될 수 있습니다. 특히 여러 물리화된 뷰가 하나의 테이블에 연결된 경우 더욱 그러합니다. 그러나 이는 몇 가지 트레이드오프가 있음을 이해하는 것이 중요합니다:

- **삽입 압력 증가**: 모든 물리화된 뷰가 동시에 실행되므로 CPU 및 메모리 사용량이 증가합니다. 각 뷰가 많은 계산이나 JOIN을 수행하면 시스템이 과부하될 수 있습니다.
- **엄격한 실행 순서 필요**: 뷰 실행 속도가 중요한 드문 워크플로가 있는 경우(예: 연결된 종속성) 병렬 실행은 일관성 없는 상태나 경쟁 조건을 초래할 수 있습니다. 이를 설계할 수 있지만, 이런 설정은 취약하며 향후 버전에서 깨질 수 있습니다.

:::note Historical defaults and stability
순차 실행은 오랜 기간 기본 설정이었으며 일부 오류 처리의 복잡성으로 인해 그러했습니다. 과거에는 하나의 물리화된 뷰에서 실패하면 다른 뷰의 실행을 막을 수 있었습니다. 최신 버전에서는 블록별 오류를 격리하여 이를 개선했지만, 여전히 순차 실행이 보다 명확한 실패 의미를 제공합니다.
:::

일반적으로 `parallel_view_processing=1`을 활성화하는 것이 좋습니다:

- 여러 개의 독립적인 물리화된 뷰가 있거나
- 삽입 성능을 극대화할 계획이거나
- 동시 뷰 실행을 처리할 수 있는 시스템 용량을 인지하고 있을 때

비활성화하는 것이 좋습니다:

- 물리화된 뷰 간에 의존관계가 있을 때
- 예측 가능한 순차 실행이 필요할 때
- 삽입 동작을 디버그하거나 감사하고자 할 때 결정론적인 재생을 원할 때

## Materialized views and Common Table Expressions (CTE) {#materialized-views-common-table-expressions-ctes}

**비재귀적** 공통 테이블 표현식(CTE)은 물리화된 뷰에서 지원됩니다.

:::note Common Table Expressions **are not** materialized
ClickHouse는 CTE를 물리화하지 않습니다. 대신 CTE 정의를 직접 쿼리에 대입하여 같은 표현식을 여러 번 평가하게 될 수 있습니다(CTE가 두 번 이상 사용될 경우).
:::

다음 예를 고려하여 각 게시물 유형의 일일 활동을 계산합니다.

```sql
CREATE TABLE daily_post_activity
(
    Day Date,
 PostType String,
 PostsCreated SimpleAggregateFunction(sum, UInt64),
 AvgScore AggregateFunction(avg, Int32),
 TotalViews SimpleAggregateFunction(sum, UInt64)
)
ENGINE = AggregatingMergeTree
ORDER BY (Day, PostType);

CREATE MATERIALIZED VIEW daily_post_activity_mv TO daily_post_activity AS
WITH filtered_posts AS (
    SELECT
 toDate(CreationDate) AS Day,
 PostTypeId,
 Score,
 ViewCount
    FROM posts
    WHERE Score > 0 AND PostTypeId IN (1, 2)  -- Question or Answer
)
SELECT
    Day,
    CASE PostTypeId
        WHEN 1 THEN 'Question'
        WHEN 2 THEN 'Answer'
    END AS PostType,
    count() AS PostsCreated,
    avgState(Score) AS AvgScore,
    sum(ViewCount) AS TotalViews
FROM filtered_posts
GROUP BY Day, PostTypeId;
```

CTE는 여기에서 엄밀히 필요하지는 않지만 예시를 위해 뷰는 예상대로 작동합니다:

```sql
INSERT INTO posts
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
```

```sql
SELECT
    Day,
    PostType,
    avgMerge(AvgScore) AS AvgScore,
    sum(PostsCreated) AS PostsCreated,
    sum(TotalViews) AS TotalViews
FROM daily_post_activity
GROUP BY
    Day,
    PostType
ORDER BY Day DESC
LIMIT 10

┌────────Day─┬─PostType─┬───────────AvgScore─┬─PostsCreated─┬─TotalViews─┐
│ 2024-03-31 │ Question │ 1.3317757009345794 │          214 │       9728 │
│ 2024-03-31 │ Answer   │ 1.4747191011235956 │          356 │          0 │
│ 2024-03-30 │ Answer   │ 1.4587912087912087 │          364 │          0 │
│ 2024-03-30 │ Question │ 1.2748815165876777 │          211 │       9606 │
│ 2024-03-29 │ Question │ 1.2641509433962264 │          318 │      14552 │
│ 2024-03-29 │ Answer   │ 1.4706927175843694 │          563 │          0 │
│ 2024-03-28 │ Answer   │  1.601637107776262 │          733 │          0 │
│ 2024-03-28 │ Question │ 1.3530864197530865 │          405 │      24564 │
│ 2024-03-27 │ Question │ 1.3225806451612903 │          434 │      21346 │
│ 2024-03-27 │ Answer   │ 1.4907539118065434 │          703 │          0 │
└────────────┴──────────┴────────────────────┴──────────────┴────────────┘

10 rows in set. Elapsed: 0.013 sec. Processed 11.45 thousand rows, 663.87 KB (866.53 thousand rows/s., 50.26 MB/s.)
Peak memory usage: 989.53 KiB.
```

ClickHouse에서 CTE는 인라인 처리되어 쿼리 최적화 중에 사실상 복사-붙여넣기 되어 **물리화되지 않**습니다. 이는 다음을 의미합니다:

- CTE가 소스 테이블(즉, 물리화된 뷰가 연결된 테이블)과 다른 테이블을 참조하고, `JOIN` 또는 `IN` 절에서 사용될 경우 서브쿼리 또는 조인처럼 작동합니다.
- 물리화된 뷰는 여전히 소스 테이블에 대한 삽입에서만 트리거되지만, CTE는 모든 삽입에 대해 다시 실행됩니다. 이는 참조된 테이블이 클 경우 불필요한 오버헤드를 초래할 수 있습니다.

예를 들어,

```sql
WITH recent_users AS (
  SELECT Id FROM stackoverflow.users WHERE CreationDate > now() - INTERVAL 7 DAY
)
SELECT * FROM stackoverflow.posts WHERE OwnerUserId IN (SELECT Id FROM recent_users)
```

이 경우, users CTE는 posts에 대한 모든 삽입 시 재평가되며, 물리화된 뷰는 새로운 사용자가 삽입될 때 업데이트되지 않습니다 - 게시물 삽입 시에만 업데이트됩니다.

일반적으로 CTE는 물리화된 뷰가 연결된 동일한 소스 테이블을 기준으로 작업을 수행하거나, 참조된 테이블이 작고 성능을 저해할 가능성이 적도록 조정하는 것이 좋습니다. 대안으로는 [물리화된 뷰의 JOIN에서 사용하는 것과 같은 최적화를 고려하십시오](/materialized-view/incremental-materialized-view#join-best-practices).
