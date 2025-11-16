---
'slug': '/best-practices/choosing-a-primary-key'
'sidebar_position': 10
'sidebar_label': '기본 키 선택하기'
'title': '기본 키 선택하기'
'description': '이 페이지는 ClickHouse에서 기본 키를 선택하는 방법을 설명합니다.'
'keywords':
- 'primary key'
'show_related_blogs': true
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import create_primary_key from '@site/static/images/bestpractices/create_primary_key.gif';
import primary_key from '@site/static/images/bestpractices/primary_key.gif';

> 이 페이지에서는 "주문 키"라는 용어를 "기본 키"와 상호 교환적으로 사용합니다. 엄밀히 말하면, [이들은 ClickHouse에서 다릅니다](/engines/table-engines/mergetree-family/mergetree#choosing-a-primary-key-that-differs-from-the-sorting-key), 그러나 이 문서의 목적상, 독자는 이들을 상호 교환 가능하게 사용할 수 있으며, 주문 키는 테이블 `ORDER BY`에서 지정된 컬럼을 가리킵니다.

ClickHouse의 기본 키는 OLTP 데이터베이스와 유사한 용어에 익숙한 사람들에게는 [매우 다르게](/migrations/postgresql/data-modeling-techniques#primary-ordering-keys-in-clickhouse) 작동합니다.

ClickHouse에서 효과적인 기본 키를 선택하는 것은 쿼리 성능과 저장 효율성에 매우 중요합니다. ClickHouse는 데이터를 여러 파트로 구성하며, 각 파트는 자체 스파스 기본 인덱스를 포함합니다. 이 인덱스는 스캔되는 데이터 양을 줄여 쿼리 속도를 크게 향상시킵니다. 또한 기본 키는 디스크상의 데이터 물리적 순서를 결정하므로, 압축 효율성에 직접적인 영향을 미칩니다. 최적의 순서로 정렬된 데이터는 더 효과적으로 압축되어 I/O를 줄여 성능을 더 향상시킵니다.

1. 주문 키를 선택할 때, 쿼리 필터(즉, `WHERE` 절)에서 자주 사용되는 컬럼을 우선시하십시오. 특히 많은 행을 제외하는 컬럼이 중요합니다.
2. 테이블의 다른 데이터와 높은 상관관계를 가진 컬럼도 유익하며, 연속 저장이 `GROUP BY` 및 `ORDER BY` 작업 중에 압축 비율과 메모리 효율성을 개선합니다.
<br/>
주문 키 선택을 도와줄 간단한 규칙을 적용할 수 있습니다. 다음 항목들은 때때로 상충할 수 있으므로 순서에 따라 고려하십시오. **사용자는 이 과정에서 여러 키를 식별할 수 있으며, 일반적으로 4-5개가 충분합니다**:

:::note Important
주문 키는 테이블 생성 시 정의되어야 하며 추가할 수 없습니다. 데이터 삽입 후(또는 전에) 프로젝션으로 알려진 기능을 통해 테이블에 추가 주문을 추가할 수 있습니다. 이 경우 데이터 중복이 발생합니다. 추가 세부정보는 [여기서]( /sql-reference/statements/alter/projection) 확인하십시오.
:::

## 예시 {#example}

`posts_unordered` 테이블을 고려해 보십시오. 이 테이블은 Stack Overflow 게시물마다 행을 포함합니다.

이 테이블에는 기본 키가 없습니다 - `ORDER BY tuple()`로 표시됩니다.

```sql
CREATE TABLE posts_unordered
(
  `Id` Int32,
  `PostTypeId` Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 
  'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
  `AcceptedAnswerId` UInt32,
  `CreationDate` DateTime,
  `Score` Int32,
  `ViewCount` UInt32,
  `Body` String,
  `OwnerUserId` Int32,
  `OwnerDisplayName` String,
  `LastEditorUserId` Int32,
  `LastEditorDisplayName` String,
  `LastEditDate` DateTime,
  `LastActivityDate` DateTime,
  `Title` String,
  `Tags` String,
  `AnswerCount` UInt16,
  `CommentCount` UInt8,
  `FavoriteCount` UInt8,
  `ContentLicense`LowCardinality(String),
  `ParentId` String,
  `CommunityOwnedDate` DateTime,
  `ClosedDate` DateTime
)
ENGINE = MergeTree
ORDER BY tuple()
```

사용자가 2024년 이후 제출된 질문 수를 계산하려고 한다고 가정해 보겠습니다. 이 쿼리는 가장 일반적인 접근 패턴을 나타냅니다.

```sql
SELECT count()
FROM stackoverflow.posts_unordered
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')

┌─count()─┐
│  192611 │
└─────────┘
--highlight-next-line
1 row in set. Elapsed: 0.055 sec. Processed 59.82 million rows, 361.34 MB (1.09 billion rows/s., 6.61 GB/s.)
```

이 쿼리로 읽은 행 수와 바이트 수에 주목하십시오. 기본 키가 없으면 쿼리는 전체 데이터 세트를 스캔해야 합니다.

`EXPLAIN indexes=1`을 사용하면 인덱스의 부족으로 인한 전체 테이블 스캔을 확인할 수 있습니다.

```sql
EXPLAIN indexes = 1
SELECT count()
FROM stackoverflow.posts_unordered
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')

┌─explain───────────────────────────────────────────────────┐
│ Expression ((Project names + Projection))                 │
│   Aggregating                                             │
│     Expression (Before GROUP BY)                          │
│       Expression                                          │
│         ReadFromMergeTree (stackoverflow.posts_unordered) │
└───────────────────────────────────────────────────────────┘

5 rows in set. Elapsed: 0.003 sec.
```

`posts_ordered`라는 동일한 데이터를 포함하는 테이블이 `(PostTypeId, toDate(CreationDate))`로 정의된 `ORDER BY`와 함께 있다고 가정해 보겠습니다.

```sql
CREATE TABLE posts_ordered
(
  `Id` Int32,
  `PostTypeId` Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 
  'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
...
)
ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate))
```

`PostTypeId`는 8의 카디널리티를 가지며, 우리의 주문 키의 첫 번째 항목으로 논리적인 선택을 나타냅니다. 날짜 세분화 필터링이 충분할 것이라고 인식하면서 (여전히 날짜 및 시간 필터에 이점이 있을 것입니다) `toDate(CreationDate)`를 키의 두 번째 구성 요소로 사용합니다. 날짜는 16비트로 표현할 수 있으므로 더 작은 인덱스를 생성하여 필터링 속도를 높입니다.

다음 애니메이션은 Stack Overflow 게시물 테이블의 최적화된 스파스 기본 인덱스가 생성되는 방법을 보여줍니다. 개별 행을 인덱싱하는 대신, 인덱스는 행 블록을 대상으로 합니다:

<Image img={create_primary_key} size="lg" alt="Primary key" />

이 주문 키가 있는 테이블에서 동일한 쿼리를 반복하면:

```sql
SELECT count()
FROM stackoverflow.posts_ordered
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')

┌─count()─┐
│  192611 │
└─────────┘
--highlight-next-line
1 row in set. Elapsed: 0.013 sec. Processed 196.53 thousand rows, 1.77 MB (14.64 million rows/s., 131.78 MB/s.)
```

이 쿼리는 이제 스파스 인덱싱을 활용하여 읽는 데이터 양을 크게 줄이고 실행 시간을 4배 향상시킵니다 - 읽은 행과 바이트 수의 감소를 주목하십시오.

인덱스 사용은 `EXPLAIN indexes=1`로 확인할 수 있습니다.

```sql
EXPLAIN indexes = 1
SELECT count()
FROM stackoverflow.posts_ordered
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')

┌─explain─────────────────────────────────────────────────────────────────────────────────────┐
│ Expression ((Project names + Projection))                                                   │
│   Aggregating                                                                               │
│     Expression (Before GROUP BY)                                                            │
│       Expression                                                                            │
│         ReadFromMergeTree (stackoverflow.posts_ordered)                                     │
│         Indexes:                                                                            │
│           PrimaryKey                                                                        │
│             Keys:                                                                           │
│               PostTypeId                                                                    │
│               toDate(CreationDate)                                                          │
│             Condition: and((PostTypeId in [1, 1]), (toDate(CreationDate) in [19723, +Inf))) │
│             Parts: 14/14                                                                    │
│             Granules: 39/7578                                                               │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

13 rows in set. Elapsed: 0.004 sec.
```

또한, 스파스 인덱스가 예제 쿼리에 대한 일치 항목을 포함할 수 없는 모든 행 블록을 어떻게 잘라내는지를 시각화합니다:

<Image img={primary_key} size="lg" alt="Primary key" />

:::note
테이블의 모든 컬럼은 지정된 주문 키의 값에 따라 정렬됩니다. 키 자체에 포함되어 있는지와 관계없이 처리됩니다. 예를 들어, `CreationDate`가 키로 사용되면 다른 모든 컬럼의 값 순서는 `CreationDate` 컬럼의 값 순서와 일치합니다. 여러 개의 주문 키를 지정할 수 있으며, 이는 `SELECT` 쿼리의 `ORDER BY` 절과 동일한 의미로 정렬됩니다.
:::

기본 키 선택에 대한 완전한 고급 가이드는 [여기에서]( /guides/best-practices/sparse-primary-indexes) 확인하실 수 있습니다.

주문 키가 압축을 개선하고 저장을 더 최적화하는 방법에 대한 자세한 내용은 [ClickHouse의 압축](/data-compression/compression-in-clickhouse) 및 [컬럼 압축 코덱](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec)에 대한 공식 가이드를 참조하십시오.
