---
slug: /data-modeling/denormalization
title: '데이터 비정규화'
description: '비정규화를 사용해 쿼리 성능을 개선하는 방법'
keywords: ['데이터 비정규화', '비정규화', '쿼리 최적화']
doc_type: 'guide'
---

import denormalizationDiagram from '@site/static/images/data-modeling/denormalization-diagram.png';
import denormalizationSchema from '@site/static/images/data-modeling/denormalization-schema.png';
import Image from '@theme/IdealImage';


# 데이터 비정규화 \{#denormalizing-data\}

데이터 비정규화는 ClickHouse에서 조인을 수행하지 않고도 쿼리 지연 시간을 줄이기 위해 평탄화된(플랫) 테이블을 사용하는 기법입니다.

## 정규화된 스키마와 비정규화된 스키마 비교 \{#comparing-normalized-vs-denormalized-schemas\}

데이터를 비정규화한다는 것은 특정 쿼리 패턴에 맞춰 데이터베이스 성능을 최적화하기 위해 의도적으로 정규화 과정을 되돌리는 것을 의미합니다. 정규화된 데이터베이스에서는 중복을 최소화하고 데이터 무결성을 보장하기 위해 데이터를 여러 개의 서로 연관된 테이블로 분리합니다. 비정규화는 테이블을 결합하고, 데이터를 중복 저장하며, 계산된 필드를 하나의 테이블 또는 더 적은 수의 테이블에 포함시켜 중복을 다시 도입합니다. 이렇게 함으로써 조인을 쿼리 시점에서 삽입 시점으로 옮기게 됩니다.

이 과정은 쿼리 시점에 복잡한 조인의 필요성을 줄이고 읽기 작업 속도를 크게 향상시킬 수 있어, 읽기 비중이 높고 쿼리가 복잡한 애플리케이션에 적합합니다. 그러나 중복된 데이터에 대한 변경 사항을 일관성을 유지하기 위해 모든 인스턴스에 전파해야 하므로, 쓰기 작업과 유지 관리의 복잡성이 증가할 수 있습니다.

<Image img={denormalizationDiagram} size="lg" alt="ClickHouse에서의 비정규화"/>

<br />

NoSQL 솔루션에서 널리 사용되는 일반적인 기법은 `JOIN` 지원이 없을 때 데이터를 비정규화하여, 모든 통계 또는 연관된 행을 상위 행에 컬럼 및 중첩 객체 형태로 저장하는 것입니다. 예를 들어, 블로그 스키마 예시에서는 모든 `Comments`를 각 게시물에 대한 객체의 `Array`로 저장할 수 있습니다.

## 비정규화를 사용할 때 \{#when-to-use-denormalization\}

일반적으로 다음과 같은 경우에 비정규화를 권장합니다:

- 변경이 자주 발생하지 않거나, 데이터가 분석용 쿼리에 사용 가능해질 때까지 일정한 지연을 허용할 수 있는 테이블을 비정규화합니다. 즉, 데이터를 배치로 전체 재적재할 수 있어야 합니다.
- 다대다 관계는 비정규화를 피합니다. 단일 소스 행이 변경될 때 많은 행을 함께 업데이트해야 할 수 있습니다.
- 카디널리티가 매우 높은(high cardinality) 관계는 비정규화를 피합니다. 테이블의 각 행이 다른 테이블의 수천 개의 관련 항목을 갖는 경우, 이러한 항목은 기본 타입 또는 튜플로 이루어진 `Array`로 표현해야 합니다. 일반적으로 1000개를 초과하는 튜플을 가진 배열은 권장되지 않습니다.
- 모든 컬럼을 중첩 객체로 비정규화하는 대신, 아래에 설명된 materialized view를 사용하여 통계 값만 비정규화하는 방안을 고려하십시오.

모든 정보를 비정규화할 필요는 없으며, 자주 접근해야 하는 핵심 정보만 비정규화하면 됩니다.

비정규화 작업은 ClickHouse 내에서 처리할 수도 있고, Apache Flink와 같은 업스트림 시스템에서 처리할 수도 있습니다.

## 자주 업데이트되는 데이터에는 비정규화를 피하십시오 \{#avoid-denormalization-on-frequently-updated-data\}

ClickHouse에서 비정규화는 쿼리 성능을 최적화하기 위해 사용할 수 있는 여러 옵션 중 하나이지만, 신중하게 사용해야 합니다. 데이터가 자주 변경되고 거의 실시간으로 반영되어야 하는 경우에는 이 접근 방식은 피해야 합니다. 기본 테이블이 대부분 추가 전용(append-only)에 가깝거나, 예를 들어 매일과 같이 배치로 주기적으로 다시 로드할 수 있는 경우에만 사용하십시오.

이 접근 방식은 본질적으로 하나의 주요 과제, 즉 쓰기 성능과 데이터 업데이트 문제를 안고 있습니다. 보다 구체적으로, 비정규화는 사실상 데이터 조인에 대한 책임을 쿼리 시점에서 수집 시점으로 이전합니다. 이는 쿼리 성능을 크게 향상시킬 수 있지만, 수집을 복잡하게 만들며, 이를 구성하는 데 사용된 행 중 하나라도 변경되면 데이터 파이프라인이 해당 행을 ClickHouse에 다시 삽입해야 함을 의미합니다. 이는 하나의 소스 행 변경이 잠재적으로 ClickHouse의 많은 행이 업데이트되어야 함을 의미할 수 있습니다. 복잡한 스키마에서 행이 복잡한 조인으로 구성된 경우, 조인의 중첩 구성 요소에 있는 단일 행 변경으로 인해 잠재적으로 수백만 개의 행을 업데이트해야 할 수도 있습니다.

이를 실시간으로 달성하는 것은 대부분의 경우 비현실적이며, 다음 두 가지 과제로 인해 상당한 엔지니어링 노력이 필요합니다:

1. 테이블 행이 변경될 때 올바른 조인 SQL 문을 트리거하는 것. 이상적으로는 조인 대상이 되는 모든 객체를 업데이트하는 것이 아니라, 영향받은 것만 업데이트해야 합니다. 조인을 수정하여 올바른 행만 효율적으로 필터링하고, 이를 높은 처리량 환경에서 달성하려면 외부 도구나 추가적인 엔지니어링이 필요합니다.
1. ClickHouse에서 행 업데이트를 신중하게 관리해야 하므로, 추가적인 복잡성이 발생합니다.

<br />

따라서 모든 비정규화된 객체를 주기적으로 다시 로드하는 배치 업데이트 프로세스를 사용하는 방식이 더 일반적입니다.

## 비정규화의 실제 사례 \{#practical-cases-for-denormalization\}

비정규화가 타당할 수 있는 몇 가지 실제 예시와, 다른 접근 방식이 더 바람직한 경우를 함께 살펴보겠습니다.

`AnswerCount` 및 `CommentCount`와 같은 통계 정보로 이미 비정규화된 `Posts` 테이블이 있다고 가정합니다. 소스 데이터는 이와 같은 형태로 제공됩니다. 실제로는 이 정보가 자주 변경될 가능성이 높으므로, 이를 정규화하고 싶어질 수 있습니다. 이러한 컬럼의 상당수는 다른 테이블을 통해서도 확인할 수 있습니다. 예를 들어, 특정 게시물의 댓글은 `PostId` 컬럼과 `Comments` 테이블을 통해 조회할 수 있습니다. 예시를 위해, 게시물이 배치 프로세스로 다시 로드된다고 가정합니다.

또한 분석을 위한 주요 테이블을 `Posts`로 가정하고, 다른 테이블을 `Posts`에 비정규화하는 경우만 고려합니다. 반대 방향으로 비정규화하는 것도 일부 쿼리에서는 적절할 수 있으며, 위에서 언급한 동일한 고려사항이 적용됩니다.

*아래 각 예시에서, 두 테이블을 조인에 사용해야 하는 쿼리가 존재한다고 가정합니다.*

### 게시물과 투표 \{#posts-and-votes\}

게시물에 대한 투표는 별도의 테이블로 표현됩니다. 이에 대한 최적화된 스키마와 데이터를 적재하기 위한 INSERT 명령은 아래와 같습니다.

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

언뜻 보기에는 이러한 항목들이 posts 테이블에서 비정규화할 대상으로 보입니다. 하지만 이 방식에는 몇 가지 어려움이 있습니다.

게시물에는 투표가 자주 추가됩니다. 시간이 지남에 따라 게시물별 투표 수는 줄어들 수 있지만, 다음 쿼리를 보면 약 3만 개의 게시물에 대해 시간당 약 4만 개의 투표가 발생하고 있음을 알 수 있습니다.

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

지연을 허용할 수 있다면 배치 처리로 이 문제를 해결할 수는 있지만, 전체 게시물을 주기적으로 다시 로드하지 않는 한(그다지 바람직하지 않을 가능성이 큽니다) 여전히 업데이트를 처리해야 합니다.

더 문제가 되는 점은 일부 게시물의 투표 수가 극단적으로 많다는 것입니다:

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

여기서 핵심은 대부분의 분석에는 각 게시물에 대한 집계된 투표 통계만으로도 충분하며, 모든 투표 정보를 비정규화할 필요는 없다는 점입니다. 예를 들어, 현재 `Score` 컬럼은 이러한 통계, 즉 전체 추천 수에서 비추천 수를 뺀 값을 나타냅니다. 이상적으로는 이러한 통계를 쿼리 시점에 간단한 조회만으로 가져올 수 있으면 좋습니다(자세한 내용은 [dictionaries](/dictionary)를 참조하십시오).


### Users 및 Badges \{#users-and-badges\}

이제 `Users`와 `Badges`를 살펴보겠습니다.

<Image img={denormalizationSchema} size="lg" alt="Users and Badges 스키마" />

<p />

먼저 다음 명령을 사용해 데이터를 삽입합니다.

<p />

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

사용자는 배지를 자주 획득할 수 있지만, 이 데이터셋을 하루보다 더 자주 업데이트해야 할 가능성은 낮습니다. 배지와 사용자 간의 관계는 일대다입니다. 배지를 튜플 목록으로 사용자 레코드에 단순히 비정규화해서 저장하면 될까요? 가능하긴 하지만, 사용자당 배지의 최대 개수를 빠르게 확인해 보면 이것이 그다지 이상적인 방법은 아니라는 점을 알 수 있습니다:

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

19,000개의 객체를 단일 행에 비정규화하는 것은 현실적이지 않을 수 있습니다. 이 관계는 별도의 테이블로 두거나 통계 정보를 추가하는 방식으로 유지하는 것이 가장 적절할 수 있습니다.

> 예를 들어 배지 개수처럼 배지에서 사용자로 통계 정보를 비정규화하고자 할 수 있습니다. 이 데이터셋에 대해 삽입 시점에 dictionary를 사용할 때 이러한 예제를 다룹니다.


### Posts 및 PostLinks \{#posts-and-postlinks\}

`PostLinks`는 사용자가 서로 관련되었거나 중복된다고 판단한 `Posts`를 연결합니다. 다음 쿼리는 스키마와 로드 명령을 보여 줍니다.

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

비정규화를 수행하지 못할 정도로 링크 수가 너무 많은 게시물은 없음을 확인할 수 있습니다:

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

마찬가지로, 이러한 링크도 그렇게 자주 발생하는 이벤트는 아닙니다.

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

아래에서는 이를 비정규화 예제로 사용합니다.


### 단순 통계 예시 \{#simple-statistic-example\}

대부분의 경우 비정규화는 상위 행에 단일 컬럼이나 통계를 추가하는 작업이 필요합니다. 예를 들어 게시글에 중복 게시글 수를 나타내는 정보를 추가하고자 할 수 있으며, 이 경우 컬럼 하나만 추가하면 됩니다.

```sql
CREATE TABLE posts_with_duplicate_count
(
  `Id` Int32 CODEC(Delta(4), ZSTD(1)),
   ... -other columns
   `DuplicatePosts` UInt16
) ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
```

이 테이블에 데이터를 채우기 위해 중복 통계와 게시물 테이블을 조인하는 `INSERT INTO SELECT` 구문을 사용합니다.

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


### 일대다(one-to-many) 관계를 위한 복합 타입 활용 \{#exploiting-complex-types-for-one-to-many-relationships\}

비정규화를 수행하려면 복합 타입을 활용해야 하는 경우가 많습니다. 일대일(one-to-one) 관계를 적은 수의 컬럼으로 비정규화하는 경우에는, 위에서 본 것처럼 해당 컬럼들을 원래 타입 그대로 행으로 단순히 추가하면 됩니다. 그러나 규모가 큰 객체에는 바람직하지 않은 경우가 많고, 일대다 관계에는 이러한 방식이 불가능합니다.

복합 객체나 일대다 관계인 경우에는 다음과 같은 방식을 사용할 수 있습니다.

* Named Tuples - 관련된 구조를 하나의 컬럼 집합으로 표현할 수 있습니다.
* Array(Tuple) 또는 Nested - Named Tuple의 배열로, Nested라고도 하며 각 항목이 하나의 객체를 나타냅니다. 일대다 관계에 적용할 수 있습니다.

예제로, 아래에서는 `PostLinks`를 `Posts`에 비정규화하는 방법을 보여줍니다.

각 게시물은 앞서 제시한 `PostLinks` 스키마에서 보았듯이 다른 게시물에 대한 여러 개의 링크를 포함할 수 있습니다. Nested 타입에서는 이러한 링크 대상 게시물과 중복 게시물을 다음과 같이 표현할 수 있습니다.

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

> `flatten_nested=0` 설정을 사용하는 점에 유의하십시오. 중첩 데이터의 평탄화(flattening)를 비활성화할 것을 권장합니다.

`OUTER JOIN` 쿼리를 사용한 `INSERT INTO SELECT`로 이 비정규화 작업을 수행할 수 있습니다:

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

> 여기에서 처리 시간을 확인하십시오. 약 2분 만에 6,600만 행을 비정규화했습니다. 이후에 보겠지만, 이 작업은 스케줄링할 수 있습니다.

조인 전에 `PostId`별로 `PostLinks`를 하나의 배열로 모으기 위해 `groupArray` 함수를 사용한 점에 주목하십시오. 그런 다음 이 배열은 두 개의 하위 목록인 `LinkedPosts`와 `DuplicatePosts`로 필터링되며, 여기에는 외부 조인에서 나온 비어 있는 결과는 모두 제외됩니다.

새로운 비정규화된 구조를 확인하기 위해 일부 행을 선택해 볼 수 있습니다:

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


## 비정규화 작업 오케스트레이션과 스케줄링 \{#orchestrating-and-scheduling-denormalization\}

### Batch \{#batch\}

비정규화를 활용하려면 이를 수행하고 오케스트레이션할 수 있는 변환 프로세스가 필요합니다.

앞에서 `INSERT INTO SELECT`를 통해 데이터가 로드된 후 ClickHouse를 사용하여 이 변환을 수행하는 방법을 보였습니다. 이는 주기적인 배치 변환에 적합합니다.

주기적인 배치 로드 프로세스를 사용하는 경우, ClickHouse에서 이를 오케스트레이션하는 방법으로 다음과 같은 여러 옵션이 있습니다:

- **[Refreshable Materialized Views](/materialized-view/refreshable-materialized-view)** - 갱신 가능 구체화 뷰(Refreshable Materialized View)를 사용하여 쿼리를 주기적으로 스케줄링하고 결과를 대상 테이블로 전송할 수 있습니다. 쿼리가 실행되면 뷰가 대상 테이블이 원자적으로 업데이트되도록 합니다. 이는 이 작업을 스케줄링하기 위한 ClickHouse 고유의 방법을 제공합니다.
- **External tooling** - [dbt](https://www.getdbt.com/) 및 [Airflow](https://airflow.apache.org/)와 같은 도구를 활용하여 변환 작업을 주기적으로 스케줄링할 수 있습니다. [ClickHouse integration for dbt](/integrations/dbt)는 대상 테이블의 새 버전을 생성한 후, 쿼리를 수신하는 버전과 원자적으로 교체되도록 보장합니다( [EXCHANGE](/sql-reference/statements/exchange) 명령을 통해).

### 스트리밍 \{#streaming\}

또는 이 작업을 데이터 삽입 이전에 ClickHouse 외부에서 [Apache Flink](https://flink.apache.org/)와 같은 스트리밍 기술을 사용하여 수행할 수도 있습니다. 또는 데이터가 삽입될 때 이 처리를 수행하도록 증분 [materialized views](/guides/developer/cascading-materialized-views)를 사용할 수도 있습니다.