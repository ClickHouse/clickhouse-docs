---
'slug': '/best-practices/use-data-skipping-indices-where-appropriate'
'sidebar_position': 10
'sidebar_label': '데이터 스킵 인덱스'
'title': '적절한 경우 데이터 스킵 인덱스를 사용하세요'
'description': '데이터 스킵 인덱스를 사용하는 방법과 시기를 설명하는 페이지'
'keywords':
- 'data skipping index'
- 'skip index'
'show_related_blogs': true
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import building_skipping_indices from '@site/static/images/bestpractices/building_skipping_indices.gif';
import using_skipping_indices from '@site/static/images/bestpractices/using_skipping_indices.gif';

데이터 스킵 인덱스는 기본 키가 특정 필터 조건에 유용하지 않은 경우 쿼리 실행 중 스캔되는 데이터 양을 극적으로 줄일 수 있는 강력한 메커니즘입니다. 이전 최선의 관행이 따랐던 경우, 즉 데이터 타입이 최적화되고 좋은 기본 키가 선택되어 물리화된 뷰가 활용되었을 때 고려해야 합니다. 스킵 인덱스 사용이 처음이라면 [이 가이드](/optimize/skipping-indexes)를 시작하기에 좋은 곳입니다.

이러한 유형의 인덱스는 사용 방법을 이해하고 신중하게 사용할 경우 쿼리 성능을 가속화하는 데 사용할 수 있습니다.

ClickHouse는 스캔하는 데이터 양을 줄이는 데 도움을 주는 **데이터 스킵 인덱스**를 제공합니다. 전통적인 데이터베이스는 행 기반의 보조 인덱스 (예: B-트리)에 의존하지만 ClickHouse는 컬럼형 스토어로 행 위치를 이러한 구조를 지원하는 방식으로 저장하지 않습니다. 대신 스킵 인덱스를 사용하여 쿼리의 필터 조건과 일치하지 않는 데이터 블록을 읽지 않도록 돕습니다.

스킵 인덱스는 데이터 블록에 대한 메타데이터를 저장함으로써 작동합니다. 이 메타데이터는 최소/최대 값, 값 집합 또는 Bloom 필터 표현과 같은 정보를 포함하며 쿼리 실행 시 이 메타데이터를 사용하여 어떤 데이터 블록을 완전히 스킵할 수 있는지를 판단합니다. 이러한 인덱스는 [MergeTree 패밀리](/engines/table-engines/mergetree-family/mergetree)의 테이블 엔진에만 적용되며, 표현식, 인덱스 유형, 이름 및 각 인덱스 블록의 크기를 정의하는 세분화를 사용하여 정의됩니다. 이러한 인덱스는 테이블 데이터와 함께 저장되며, 쿼리 필터가 인덱스 표현과 일치할 때 참조됩니다.

데이터 스킵 인덱스에는 여러 유형이 있으며, 각 유형은 다양한 쿼리 및 데이터 분포에 적합합니다:

* **minmax**: 블록당 표현식의 최소 및 최대 값을 추적합니다. 느슨하게 정렬된 데이터에 대한 범위 쿼리에 이상적입니다.
* **set(N)**: 각 블록에 대해 지정된 크기 N까지의 값 집합을 추적합니다. 블록당 낮은 카디널리티 컬럼에 효과적입니다.
* **bloom_filter**: 특정 블록에 값이 존재하는지 확률적으로 판단하여 집합 멤버십에 대한 빠른 근사 필터링을 허용합니다. "바늘 찾기"와 같은 쿼리를 최적화하는 데 효과적입니다.
* **tokenbf_v1 / ngrambf_v1**: 문자열에서 토큰이나 문자 시퀀스를 검색하기 위해 설계된 전문화된 Bloom 필터 변형으로, 로그 데이터나 텍스트 검색 사용 사례에서 특히 유용합니다.

강력하지만 스킵 인덱스는 주의하여 사용해야 합니다. 이들은 데이터 블록의 의미 있는 수를 제거할 때만 이점을 제공하며, 쿼리 또는 데이터 구조가 일치하지 않으면 실제로 오버헤드를 초래할 수 있습니다. 블록에서 단 하나의 일치하는 값이 존재하더라도 해당 블록 전체를 여전히 읽어야 합니다.

**효과적인 스킵 인덱스 사용은 일반적으로 인덱스 컬럼과 테이블의 기본 키 간의 강한 상관관계에 의존하거나 비슷한 값을 함께 그룹화하여 데이터를 삽입하는 것에 달려 있습니다.**

일반적으로 데이터 스킵 인덱스는 올바른 기본 키 디자인과 데이터 타입 최적화가 보장된 후에 적용하는 것이 가장 좋습니다. 특히 유용한 경우는 다음과 같습니다:

* 전체 카디널리티가 높지만 블록마다 카디널리티가 낮은 컬럼.
* 검색에 중요한 희귀 값 (예: 오류 코드, 특정 ID).
* 비기본 키 컬럼에서 국소화된 분포로 필터링이 이루어지는 경우.

항상:

1. 실제 데이터와 현실적인 쿼리에서 스킵 인덱스를 테스트합니다. 다양한 인덱스 유형 및 세분화 값을 시도하십시오.
2. 인덱스 효과를 살펴보기 위해 send_logs_level='trace' 및 `EXPLAIN indexes=1`과 같은 도구를 사용하여 그 영향을 평가하십시오.
3. 인덱스의 크기와 세분화에 의해 영향을 받는 방식을 항상 평가하십시오. 세분화 크기를 줄이면 성능이 개선되겠지만, 낮은 세분화로 인해 인덱스 크기가 증가하면 성능이 저하될 수 있습니다. 다양한 세분화 데이터 포인트에 대한 성능 및 인덱스 크기를 측정하십시오. 이는 Bloom 필터 인덱스에 특히 관련이 있습니다.

<p/>
**적절하게 사용하면 스킵 인덱스는 상당한 성능 향상을 제공할 수 있지만, 맹목적으로 사용하면 불필요한 비용을 초래할 수 있습니다.**

데이터 스킵 인덱스에 대한 더욱 자세한 가이드는 [여기](/sql-reference/statements/alter/skipping-index)에서 확인하십시오.

## 예제 {#example}

최적화된 아래 테이블을 고려해 보십시오. 이 테이블은 각 게시물에 대한 Stack Overflow 데이터를 포함합니다.

```sql
CREATE TABLE stackoverflow.posts
(
  `Id` Int32 CODEC(Delta(4), ZSTD(1)),
  `PostTypeId` Enum8('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
  `AcceptedAnswerId` UInt32,
  `CreationDate` DateTime64(3, 'UTC'),
  `Score` Int32,
  `ViewCount` UInt32 CODEC(Delta(4), ZSTD(1)),
  `Body` String,
  `OwnerUserId` Int32,
  `OwnerDisplayName` String,
  `LastEditorUserId` Int32,
  `LastEditorDisplayName` String,
  `LastEditDate` DateTime64(3, 'UTC') CODEC(Delta(8), ZSTD(1)),
  `LastActivityDate` DateTime64(3, 'UTC'),
  `Title` String,
  `Tags` String,
  `AnswerCount` UInt16 CODEC(Delta(2), ZSTD(1)),
  `CommentCount` UInt8,
  `FavoriteCount` UInt8,
  `ContentLicense` LowCardinality(String),
  `ParentId` String,
  `CommunityOwnedDate` DateTime64(3, 'UTC'),
  `ClosedDate` DateTime64(3, 'UTC')
)
ENGINE = MergeTree
PARTITION BY toYear(CreationDate)
ORDER BY (PostTypeId, toDate(CreationDate))
```

이 테이블은 게시물 유형 및 날짜로 필터링하고 집계하는 쿼리에 최적화되어 있습니다. 2009년 이후에 발행된 조회수가 10,000,000이 넘는 게시물 수를 세고 싶다고 가정해 보겠습니다.

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1 row in set. Elapsed: 0.720 sec. Processed 59.55 million rows, 230.23 MB (82.66 million rows/s., 319.56 MB/s.)
```

이 쿼리는 기본 인덱스를 사용하여 일부 행(및 세분화)을 제외할 수 있습니다. 그러나 위 응답과 다음의 `EXPLAIN indexes = 1`에서 나타난 것처럼 여전히 대부분의 행을 읽어야 합니다.

```sql
EXPLAIN indexes = 1
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)
LIMIT 1

┌─explain──────────────────────────────────────────────────────────┐
│ Expression ((Project names + Projection))                        │
│   Limit (preliminary LIMIT (without OFFSET))                     │
│     Aggregating                                                  │
│       Expression (Before GROUP BY)                               │
│         Expression                                               │
│           ReadFromMergeTree (stackoverflow.posts)                │
│           Indexes:                                               │
│             MinMax                                               │
│               Keys:                                              │
│                 CreationDate                                     │
│               Condition: (CreationDate in ('1230768000', +Inf))  │
│               Parts: 123/128                                     │
│               Granules: 8513/8545                                │
│             Partition                                            │
│               Keys:                                              │
│                 toYear(CreationDate)                             │
│               Condition: (toYear(CreationDate) in [2009, +Inf))  │
│               Parts: 123/123                                     │
│               Granules: 8513/8513                                │
│             PrimaryKey                                           │
│               Keys:                                              │
│                 toDate(CreationDate)                             │
│               Condition: (toDate(CreationDate) in [14245, +Inf)) │
│               Parts: 123/123                                     │
│               Granules: 8513/8513                                │
└──────────────────────────────────────────────────────────────────┘

25 rows in set. Elapsed: 0.070 sec.
```

간단한 분석을 통해 `ViewCount`가 `CreationDate`(주 키)와 상관관계가 있는 것으로 나타납니다. 사용자가 예상하는 대로 게시물이 존재하는 시간이 길어질수록 더 많이 조회됩니다.

```sql
SELECT toDate(CreationDate) AS day, avg(ViewCount) AS view_count FROM stackoverflow.posts WHERE day > '2009-01-01'  GROUP BY day
```

따라서 데이터 스킵 인덱스에 대해 논리적인 선택이 됩니다. 숫자형 데이터 타입을 고려할 때, minmax 인덱스가 적합합니다. 다음 `ALTER TABLE` 명령을 사용하여 인덱스를 추가합니다. 먼저 추가한 후 "물리화"합니다.

```sql
ALTER TABLE stackoverflow.posts
  (ADD INDEX view_count_idx ViewCount TYPE minmax GRANULARITY 1);

ALTER TABLE stackoverflow.posts MATERIALIZE INDEX view_count_idx;
```

이 인덱스는 초기 테이블 생성 중에 추가할 수도 있습니다. DDL의 일환으로 minmax 인덱스가 정의된 스키마는 다음과 같습니다.

```sql
CREATE TABLE stackoverflow.posts
(
  `Id` Int32 CODEC(Delta(4), ZSTD(1)),
  `PostTypeId` Enum8('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
  `AcceptedAnswerId` UInt32,
  `CreationDate` DateTime64(3, 'UTC'),
  `Score` Int32,
  `ViewCount` UInt32 CODEC(Delta(4), ZSTD(1)),
  `Body` String,
  `OwnerUserId` Int32,
  `OwnerDisplayName` String,
  `LastEditorUserId` Int32,
  `LastEditorDisplayName` String,
  `LastEditDate` DateTime64(3, 'UTC') CODEC(Delta(8), ZSTD(1)),
  `LastActivityDate` DateTime64(3, 'UTC'),
  `Title` String,
  `Tags` String,
  `AnswerCount` UInt16 CODEC(Delta(2), ZSTD(1)),
  `CommentCount` UInt8,
  `FavoriteCount` UInt8,
  `ContentLicense` LowCardinality(String),
  `ParentId` String,
  `CommunityOwnedDate` DateTime64(3, 'UTC'),
  `ClosedDate` DateTime64(3, 'UTC'),
  INDEX view_count_idx ViewCount TYPE minmax GRANULARITY 1 --index here
)
ENGINE = MergeTree
PARTITION BY toYear(CreationDate)
ORDER BY (PostTypeId, toDate(CreationDate))
```

다음 애니메이션은 예제 테이블에 대한 minmax 스킵 인덱스가 어떻게 구축되는지를 보여주며, 테이블의 각 행 블록(세분화)에 대한 최소 및 최대 `ViewCount` 값을 추적합니다:

<Image img={building_skipping_indices} size="lg" alt="Building skipping indices"/>

이전에 한 쿼리를 반복하면 성능이 크게 향상됩니다. 스캔된 행 수가 줄어든 것을 확인하십시오:

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1 row in set. Elapsed: 0.012 sec. Processed 39.11 thousand rows, 321.39 KB (3.40 million rows/s., 27.93 MB/s.)
```

`EXPLAIN indexes = 1`은 인덱스의 사용을 확인합니다.

```sql
EXPLAIN indexes = 1
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─explain────────────────────────────────────────────────────────────┐
│ Expression ((Project names + Projection))                          │
│   Aggregating                                                      │
│     Expression (Before GROUP BY)                                   │
│       Expression                                                   │
│         ReadFromMergeTree (stackoverflow.posts)                    │
│         Indexes:                                                   │
│           MinMax                                                   │
│             Keys:                                                  │
│               CreationDate                                         │
│             Condition: (CreationDate in ('1230768000', +Inf))      │
│             Parts: 123/128                                         │
│             Granules: 8513/8545                                    │
│           Partition                                                │
│             Keys:                                                  │
│               toYear(CreationDate)                                 │
│             Condition: (toYear(CreationDate) in [2009, +Inf))      │
│             Parts: 123/123                                         │
│             Granules: 8513/8513                                    │
│           PrimaryKey                                               │
│             Keys:                                                  │
│               toDate(CreationDate)                                 │
│             Condition: (toDate(CreationDate) in [14245, +Inf))     │
│             Parts: 123/123                                         │
│             Granules: 8513/8513                                    │
│           Skip                                                     │
│             Name: view_count_idx                                   │
│             Description: minmax GRANULARITY 1                      │
│             Parts: 5/123                                           │
│             Granules: 23/8513                                      │
└────────────────────────────────────────────────────────────────────┘

29 rows in set. Elapsed: 0.211 sec.
```

또한 minmax 스킵 인덱스가 예제 쿼리에서의 `ViewCount` > 10,000,000 술어에 대해 일치할 수 없는 모든 행 블록을 어떻게 잘라내는지를 보여주는 애니메이션을 제공합니다:

<Image img={using_skipping_indices} size="lg" alt="Using skipping indices"/>

## 관련 문서 {#related-docs}
- [데이터 스킵 인덱스 가이드](/optimize/skipping-indexes)
- [데이터 스킵 인덱스 예제](/optimize/skipping-indexes/examples)
- [데이터 스킵 인덱스 조작](/sql-reference/statements/alter/skipping-index)
- [시스템 테이블 정보](/operations/system-tables/data_skipping_indices)
