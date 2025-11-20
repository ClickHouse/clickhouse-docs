---
'slug': '/data-modeling/denormalization'
'title': '비정규화 데이터'
'description': '비정규화를 사용하여 쿼리 성능을 향상시키는 방법'
'keywords':
- 'data denormalization'
- 'denormalize'
- 'query optimization'
'doc_type': 'guide'
---

import denormalizationDiagram from '@site/static/images/data-modeling/denormalization-diagram.png';
import denormalizationSchema from '@site/static/images/data-modeling/denormalization-schema.png';
import Image from '@theme/IdealImage';


# 데이터 비정규화

데이터 비정규화는 ClickHouse에서 쿼리 대기 시간을 최소화하기 위해 조인을 피하는 평면 테이블을 사용하는 기술입니다.

## 정규화된 스키마와 비정규화된 스키마 비교 {#comparing-normalized-vs-denormalized-schemas}

데이터 비정규화는 특정 쿼리 패턴에 대해 데이터베이스 성능을 최적화하기 위해 정규화 과정을 의도적으로 반전시키는 과정을 포함합니다. 정규화된 데이터베이스에서는 데이터가 중복을 최소화하고 데이터 무결성을 보장하기 위해 여러 관련 테이블로 분할됩니다. 비정규화는 테이블을 결합하고 데이터를 복제하며 계산된 필드를 단일 테이블이나 적은 수의 테이블에 포함시켜 중복을 다시 도입합니다. 이는 쿼리에서 삽입 시간으로 조인을 이동시키는 효과를 가져옵니다.

이 과정은 쿼리 시간에 복잡한 조인의 필요성을 줄이고 읽기 작업을 상당히 가속화할 수 있어, 무거운 읽기 요구 사항과 복잡한 쿼리를 가진 애플리케이션에 이상적입니다. 그러나 이는 쓰기 작업 및 유지 관리의 복잡성을 증가시킬 수 있으며, 복제된 데이터에 대한 모든 변경 사항은 일관성을 유지하기 위해 모든 인스턴스에 전파되어야 합니다.

<Image img={denormalizationDiagram} size="lg" alt="ClickHouse의 비정규화"/>

<br />

`JOIN` 지원이 없는 경우 비정규화된 데이터는 부모 행에 모든 통계 또는 관련 행을 컬럼과 중첩된 객체로 저장하는 것을 의미하는 일반적인 기술입니다. 예를 들어, 블로그의 예시 스키마에서는 해당 게시물에 대한 모든 `Comments`를 객체의 `Array`로 저장할 수 있습니다.

## 비정규화를 사용할 때 {#when-to-use-denormalization}

일반적으로 다음의 경우에 비정규화를 권장합니다:

- 데이터가 자주 변경되지 않거나 분석 쿼리에서 데이터가 제공되기까지의 지연을 감내할 수 있는 테이블에서 비정규화합니다. 즉, 데이터를 배치로 완전히 다시 로드할 수 있어야 합니다.
- 다대다 관계의 비정규화를 피합니다. 이 경우 단일 소스 행이 변경될 때 많은 행을 업데이트해야 할 수 있습니다.
- 높은 카디널리티 관계의 비정규화를 피합니다. 테이블의 각 행에 다른 테이블의 수천 개 관련 항목이 있을 경우, 이는 원시 유형 또는 튜플의 `Array`로 표현되어야 합니다. 일반적으로 1000개 이상의 튜플을 가진 배열은 비추천됩니다.
- 모든 컬럼을 중첩 객체로 비정규화하기 보다는, 물리화된 뷰를 사용하여 통계만 비정규화하는 것을 고려합니다(자세한 내용은 아래 참조).

모든 정보가 비정규화될 필요는 없습니다 - 자주 액세스해야 하는 핵심 정보만 비정규화하면 됩니다.

비정규화 작업은 ClickHouse 또는 업스트림에서 처리할 수 있으며, 예를 들어 Apache Flink를 사용할 수 있습니다.

## 자주 업데이트되는 데이터에 대한 비정규화를 피합니다 {#avoid-denormalization-on-frequently-updated-data}

ClickHouse의 경우 비정규화는 사용자가 쿼리 성능을 최적화하기 위해 사용할 수 있는 몇 가지 옵션 중 하나지만 신중하게 사용해야 합니다. 데이터가 자주 업데이트되고 거의 실시간으로 업데이트해야 하는 경우, 이 접근 방식은 피해야 합니다. 주요 테이블이 주로 추가만 가능하거나 주기적으로 배치로 새로 고쳐질 수 있다면 사용하세요. 예를 들어, 일일 단위로.

이 접근법은 단 하나의 주요 과제 - 쓰기 성능 및 데이터 업데이트로 어려움을 겪습니다. 더 구체적으로, 비정규화는 데이터 조인의 책임을 쿼리 시간에서 수집 시간으로 전환합니다. 이는 쿼리 성능을 크게 향상시킬 수 있지만, 수집을 복잡하게 만들고 데이터 파이프라인이 해당 구성 요소를 변경할 경우 ClickHouse에 행을 다시 삽입해야 함을 의미합니다. 이는 한 소스 행의 변경이 ClickHouse에 있는 많은 행을 업데이트해야 할 수 있음을 뜻합니다. 복잡한 조인으로 구성된 행이 있는 복잡한 스키마에서는 조인의 중첩 구성 요소에서 단일 행의 변경이 수백만 개의 행을 업데이트해야 할 수 있는 상황이 발생할 수 있습니다.

실시간으로 이를 달성하는 것은 종종 비현실적이며, 두 가지 과제 때문에 상당한 엔지니어링이 필요합니다:

1. 테이블 행이 변경될 때 올바른 조인 문을 트리거합니다. 이상적으로는 조인을 위해 모든 객체가 업데이트되는 것을 피해야 하며, 영향을 받은 객체만 수정해야 합니다. 높은 처리량에서 올바른 행으로 필터링하기 위해 조인을 수정하는 것은 추가 도구나 엔지니어링이 필요합니다.
2. ClickHouse에서 행 업데이트는 신중하게 관리되어야 하며, 추가적인 복잡성을 도입합니다.

<br />

따라서 모든 비정규화된 객체를 주기적으로 다시 로드하는 배치 업데이트 프로세스가 더 일반적입니다.

## 비정규화에 대한 실제 사례 {#practical-cases-for-denormalization}

비정규화가 합리적일 수 있는 몇 가지 실제 예와 대안적 접근법이 더 바람직한 사례를 고려해 봅시다.

`Posts` 테이블이 이미 `AnswerCount` 및 `CommentCount`와 같은 통계로 비정규화되어 있다고 가정해 보겠습니다. 원본 데이터가 이러한 형식으로 제공됩니다. 실제로 이 정보는 자주 변경될 가능성이 높기 때문에 정규화하는 것이 좋습니다. 이 열의 많은 데이터는 다른 테이블을 통해 사용할 수 있습니다. 예를 들어 게시물에 대한 댓글은 `PostId` 열과 `Comments` 테이블을 통해 사용 가능합니다. 예시의 목적을 위해, 우리는 게시물이 배치 프로세스를 통해 다시 로드된다고 가정합니다.

우리는 또한 `Posts`를 대상으로 다른 테이블을 비정규화하는 것만 고려합니다. 우리가 이를 분석을 위한 주요 테이블로 간주하기 때문입니다. 반대 방향으로 비정규화하는 것도 일부 쿼리에는 적합하며, 동일한 고려 사항이 적용됩니다.

*다음 예시 각각에 대해 두 테이블이 조인에 사용되어야 함을 가정합니다.*

### 게시물과 투표 {#posts-and-votes}

게시물에 대한 투표는 별도의 테이블로 표현됩니다. 최적화된 스키마는 아래에 표시되며, 데이터를 로드하기 위한 삽입 명령도 포함되어 있습니다:

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

0 rows in set. Elapsed: 26.272 sec. Processed 238.98 million rows, 2.13 GB (9.10 million rows/s., 80.97 MB/s.)
```

첫눈에 이들은 게시물 테이블에서 비정규화할 후보가 될 수 있습니다. 그러나 이 접근 방식에는 몇 가지 도전과제가 있습니다.

게시물에 투표가 자주 추가됩니다. 시간이 지남에 따라 게시물당 수가 줄어들 수 있지만, 다음 쿼리는 30,000개의 게시물에 대해 시간당 약 40,000개의 투표가 있다는 것을 보여줍니다.

```sql
SELECT round(avg(c)) AS avg_votes_per_hr, round(avg(posts)) AS avg_posts_per_hr
FROM
(
        SELECT
        toStartOfHour(CreationDate) AS hr,
        count() AS c,
        uniq(PostId) AS posts
        FROM votes
        GROUP BY hr
)

┌─avg_votes_per_hr─┬─avg_posts_per_hr─┐
│               41759 │         33322 │
└──────────────────┴──────────────────┘
```

지연을 감내할 수 있다면 배치로 해결할 수 있지만, 여전히 모든 게시물을 주기적으로 다시 로드하지 않는 한 업데이트를 처리해야 합니다(바람직하다고 보기 어려움).

더 문제가 되는 것은 일부 게시물이 매우 많은 수의 투표를 가지고 있다는 것입니다:

```sql
SELECT PostId, concat('https://stackoverflow.com/questions/', PostId) AS url, count() AS c
FROM votes
GROUP BY PostId
ORDER BY c DESC
LIMIT 5

┌───PostId─┬─url──────────────────────────────────────────┬─────c─┐
│ 11227902 │ https://stackoverflow.com/questions/11227902 │ 35123 │
│   927386 │ https://stackoverflow.com/questions/927386   │ 29090 │
│ 11227809 │ https://stackoverflow.com/questions/11227809 │ 27475 │
│   927358 │ https://stackoverflow.com/questions/927358   │ 26409 │
│  2003515 │ https://stackoverflow.com/questions/2003515  │ 25899 │
└──────────┴──────────────────────────────────────────────┴───────┘
```

여기서의 주요 관찰은 각 게시물에 대한 집계된 투표 통계가 대부분의 분석에 충분하다는 것입니다. 우리는 모든 투표정보를 비정규화할 필요가 없습니다. 예를 들어, 현재 `Score` 열은 총 업투표 수에서 다운투표 수를 뺀 통계입니다. 이상적으로는 쿼리 시간에 이 통계를 간단한 조회로 가져와야 합니다(자세한 내용은 [딕셔너리](/dictionary) 참조).

### 사용자와 배지 {#users-and-badges}

이제 `Users`와 `Badges`를 고려해 봅시다:

<Image img={denormalizationSchema} size="lg" alt="Users and Badges schema"/>

<p></p>
다음 명령어로 데이터를 삽입합니다:
<p></p>

```sql
CREATE TABLE users
(
    `Id` Int32,
    `Reputation` LowCardinality(String),
    `CreationDate` DateTime64(3, 'UTC') CODEC(Delta(8), ZSTD(1)),
    `DisplayName` String,
    `LastAccessDate` DateTime64(3, 'UTC'),
    `AboutMe` String,
    `Views` UInt32,
    `UpVotes` UInt32,
    `DownVotes` UInt32,
    `WebsiteUrl` String,
    `Location` LowCardinality(String),
    `AccountId` Int32
)
ENGINE = MergeTree
ORDER BY (Id, CreationDate)
```

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

INSERT INTO users SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/users.parquet')

0 rows in set. Elapsed: 26.229 sec. Processed 22.48 million rows, 1.36 GB (857.21 thousand rows/s., 51.99 MB/s.)

INSERT INTO badges SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 18.126 sec. Processed 51.29 million rows, 797.05 MB (2.83 million rows/s., 43.97 MB/s.)
```

사용자는 배지를 자주 획득할 수 있지만, 이는 일일 단위로 업데이트해야 할 데이터셋이 아닐 가능성이 높습니다. 배지와 사용자 간의 관계는 일대다입니다. 배지를 사용자에게 튜플 리스트로 간단히 비정규화할 수 있을까요? 가능하지만, 사용자당 최대 배지 수를 확인한 결과 이는 이상적이지 않다는 것을 시사합니다:

```sql
SELECT UserId, count() AS c FROM badges GROUP BY UserId ORDER BY c DESC LIMIT 5

┌─UserId─┬─────c─┐
│  22656 │ 19334 │
│   6309 │ 10516 │
│ 100297 │  7848 │
│ 157882 │  7574 │
│  29407 │  6512 │
└────────┴───────┘
```

19,000개의 객체를 단일 행으로 비정규화하는 것은 현실적으로 어려울 것입니다. 이 관계는 별도의 테이블로 두거나 통계를 추가하는 것이 가장 좋을 수 있습니다.

> 우리는 배지로부터 통계 정보를 사용자에게 비정규화할 수도 있습니다. 예를 들어, 배지 수와 같은 경우입니다. 우리는 삽입 시간에 이 데이터셋을 사용하여 딕셔너리를 사용하는 예를 고려합니다.

### 게시물과 포스트링크 {#posts-and-postlinks}

`PostLinks`는 사용자가 관련되거나 중복된 것으로 간주하는 `Posts`를 연결합니다. 다음 쿼리는 스키마와 로드 명령을 보여줍니다:

```sql
CREATE TABLE postlinks
(
  `Id` UInt64,
  `CreationDate` DateTime64(3, 'UTC'),
  `PostId` Int32,
  `RelatedPostId` Int32,
  `LinkTypeId` Enum('Linked' = 1, 'Duplicate' = 3)
)
ENGINE = MergeTree
ORDER BY (PostId, RelatedPostId)

INSERT INTO postlinks SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/postlinks.parquet')

0 rows in set. Elapsed: 4.726 sec. Processed 6.55 million rows, 129.70 MB (1.39 million rows/s., 27.44 MB/s.)
```

비정규화를 방지하는 과도한 링크를 가진 게시물이 없음을 확인할 수 있습니다:

```sql
SELECT PostId, count() AS c
FROM postlinks
GROUP BY PostId
ORDER BY c DESC LIMIT 5

┌───PostId─┬───c─┐
│ 22937618 │ 125 │
│  9549780 │ 120 │
│  3737139 │ 109 │
│ 18050071 │ 103 │
│ 25889234 │  82 │
└──────────┴─────┘
```

마찬가지로 이러한 링크는 지나치게 빈번하게 발생하는 이벤트가 아닙니다:

```sql
SELECT
  round(avg(c)) AS avg_votes_per_hr,
  round(avg(posts)) AS avg_posts_per_hr
FROM
(
  SELECT
  toStartOfHour(CreationDate) AS hr,
  count() AS c,
  uniq(PostId) AS posts
  FROM postlinks
  GROUP BY hr
)

┌─avg_votes_per_hr─┬─avg_posts_per_hr─┐
│                54 │                    44     │
└──────────────────┴──────────────────┘
```

우리는 다음 비정규화 예제로 이 내용을 사용합니다.

### 간단한 통계 예제 {#simple-statistic-example}

대부분의 경우, 비정규화는 부모 행에 단일 컬럼이나 통계를 추가하는 것을 요구합니다. 예를 들어, 중복 게시물의 수를 추가하여 게시물을 풍부하게 만들고 싶다면 단순히 컬럼을 추가하기만 하면 됩니다.

```sql
CREATE TABLE posts_with_duplicate_count
(
  `Id` Int32 CODEC(Delta(4), ZSTD(1)),
   ... -other columns
   `DuplicatePosts` UInt16
) ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
```

이 테이블을 채우기 위해, 우리는 중복 통계를 게시물과 조인하는 `INSERT INTO SELECT`를 사용합니다.

```sql
INSERT INTO posts_with_duplicate_count SELECT
    posts.*,
    DuplicatePosts
FROM posts AS posts
LEFT JOIN
(
    SELECT PostId, countIf(LinkTypeId = 'Duplicate') AS DuplicatePosts
    FROM postlinks
    GROUP BY PostId
) AS postlinks ON posts.Id = postlinks.PostId
```

### 일대다 관계에 대한 복합 유형 활용 {#exploiting-complex-types-for-one-to-many-relationships}

비정규화를 수행하기 위해서는 종종 복합 유형을 활용해야 합니다. 일대일 관계를 비정규화하는 경우, 열 수가 적으면 사용자가 원래 유형으로 행을 추가하는 것이 가능합니다. 그러나 이는 대형 객체의 경우가 많아 원하지 않으며 일대다 관계에서는 불가능합니다.

복합 객체나 일대다 관계의 경우 사용자는 다음을 사용할 수 있습니다:

- 명명된 튜플 - 이는 관련 구조를 열 집합으로 표현할 수 있게 해줍니다.
- Array(Tuple) 또는 Nested - 객체를 각각 나타내는 명명된 튜플의 배열로, 일대다 관계에 적용 가능합니다.

예를 들어, 아래에서 `PostLinks`를 `Posts`로 비정규화하는 것을 보여줍니다.

각 게시물은 `PostLinks` 스키마에서 보여준 것처럼 다른 게시물에 대한 링크 수를 포함할 수 있습니다. 중첩형으로 이 연결된 게시물과 중복 게시물을 다음과 같이 표현할 수 있습니다:

```sql
SET flatten_nested=0
CREATE TABLE posts_with_links
(
  `Id` Int32 CODEC(Delta(4), ZSTD(1)),
   ... -other columns
   `LinkedPosts` Nested(CreationDate DateTime64(3, 'UTC'), PostId Int32),
   `DuplicatePosts` Nested(CreationDate DateTime64(3, 'UTC'), PostId Int32),
) ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
```

> `flatten_nested=0` 설정을 사용하는 것에 유의하십시오. 중첩 데이터를 평면화하지 않는 것이 좋습니다.

`OUTER JOIN` 쿼리를 사용하여 `INSERT INTO SELECT`를 통해 이 비정규화를 수행할 수 있습니다:

```sql
INSERT INTO posts_with_links
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
) AS postlinks ON posts.Id = postlinks.PostId

0 rows in set. Elapsed: 155.372 sec. Processed 66.37 million rows, 76.33 GB (427.18 thousand rows/s., 491.25 MB/s.)
Peak memory usage: 6.98 GiB.
```

> 여기서의 타이밍에 유의하십시오. 우리는 약 2분 안에 6600만 행을 비정규화하는 데 성공했습니다. 이후에 보겠지만, 이는 우리가 스케줄할 수 있는 작업입니다.

`PostLinks`를 `PostId`별로 각 배열로 축소하기 위해 `groupArray` 함수를 사용하는 것에 유의하십시오. 이 배열은 두 개의 하위 목록인 `LinkedPosts`와 `DuplicatePosts`로 필터링되며, 외부 조인에서 빈 결과를 제외합니다.

새로운 비정규화된 구조를 보기 위해 몇 개의 행을 선택할 수 있습니다:

```sql
SELECT LinkedPosts, DuplicatePosts
FROM posts_with_links
WHERE (length(LinkedPosts) > 2) AND (length(DuplicatePosts) > 0)
LIMIT 1
FORMAT Vertical

Row 1:
──────
LinkedPosts:    [('2017-04-11 11:53:09.583',3404508),('2017-04-11 11:49:07.680',3922739),('2017-04-11 11:48:33.353',33058004)]
DuplicatePosts: [('2017-04-11 12:18:37.260',3922739),('2017-04-11 12:18:37.260',33058004)]
```

## 비정규화 조정 및 스케줄링 {#orchestrating-and-scheduling-denormalization}

### 배치 {#batch}

비정규화를 활용하려면 변환 프로세스가 필요하며, 이 프로세스를 수행하고 조정할 수 있어야 합니다.

우리는 ClickHouse를 사용하여 데이터가 `INSERT INTO SELECT`를 통해 로드된 후 이 변환을 수행하는 방법을 보여주었습니다. 이는 주기적인 배치 변환에 적합합니다.

사용자는 정기적인 배치 로드 프로세스가 허용된다면 ClickHouse에서 이를 조정할 여러 가지 옵션이 있습니다:

- **[갱신 가능한 물리화된 뷰](/materialized-view/refreshable-materialized-view)** - 갱신 가능한 물리화된 뷰를 사용하여 주기적으로 쿼리를 예약하고 그 결과를 대상 테이블로 보낼 수 있습니다. 쿼리 실행 시 뷰는 대상 테이블이 원자적으로 업데이트되도록 보장합니다. 이는 ClickHouse에서 이 작업을 스케줄링하는 자연스러운 수단입니다.
- **외부 도구** - [dbt](https://www.getdbt.com/) 및 [Airflow](https://airflow.apache.org/)와 같은 도구를 활용하여 주기적으로 변환을 스케줄합니다. [dbt에 대한 ClickHouse 통합](/integrations/dbt)은 이는 원자적으로 수행되며, 새로운 버전의 대상 테이블이 생성되어 쿼리를 수신하는 버전과 원자적으로 교환됩니다( [EXCHANGE](/sql-reference/statements/exchange) 명령을 통해).

### 스트리밍 {#streaming}

사용자는 대체로 ClickHouse 외부에서 사전 삽입 중에 이러한 작업을 수행하거나 [Apache Flink](https://flink.apache.org/)와 같은 스트리밍 기술을 사용할 수 있습니다. 또는 데이터가 삽입되는 동안 이 프로세스를 수행하기 위해 점진적인 [물리화된 뷰](/guides/developer/cascading-materialized-views)를 사용할 수 있습니다.
