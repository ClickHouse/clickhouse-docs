---
slug: /data-compression/compression-in-clickhouse
title: 'ClickHouse의 압축'
description: 'ClickHouse 압축 알고리즘 선택하기'
keywords: ['compression', 'codec', 'encoding']
doc_type: 'reference'
---

ClickHouse 쿼리 성능의 비결 중 하나는 압축입니다. 

디스크에 저장되는 데이터가 적을수록 I/O가 줄어들고, 쿼리와 INSERT가 더 빨라집니다. 대부분의 경우 CPU 관점에서 어떤 압축 알고리즘이 가지는 오버헤드는 IO 감소 효과에 의해 상쇄됩니다. 따라서 ClickHouse 쿼리를 빠르게 보장하려면 데이터 압축을 개선하는 데 가장 먼저 집중해야 합니다.

> ClickHouse가 데이터를 매우 잘 압축하는 이유에 대해서는 [이 글](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)을 읽어볼 것을 권장합니다. 요약하면, ClickHouse 컬럼 지향 데이터베이스는 값을 컬럼 순서대로 기록합니다. 이러한 값이 정렬되면 동일한 값이 서로 인접하게 배치되고, 압축 알고리즘은 데이터의 연속적인 패턴을 활용합니다. 여기에 더해, ClickHouse는 코덱과 세분화된 데이터 타입을 제공하여 압축을 더욱 쉽게 튜닝할 수 있습니다.

ClickHouse에서 압축에 영향을 미치는 주요 요소는 다음 세 가지입니다.

- 정렬 키(ordering key)
- 데이터 타입
- 사용되는 코덱

이 모든 것은 스키마를 통해 구성됩니다.

## 압축 최적화를 위한 적절한 데이터 타입 선택 \{#choose-the-right-data-type-to-optimize-compression\}

Stack Overflow 데이터셋을 예시로 사용합니다. `posts` 테이블에 대해 다음 스키마의 압축 통계를 비교합니다:

* `posts` - 정렬 키가 없고 타입 최적화가 되지 않은 스키마.
* `posts_v3` - 각 컬럼에 대해 적절한 타입과 비트 크기를 사용하고, 정렬 키 `(PostTypeId, toDate(CreationDate), CommentCount)`를 포함한 타입 최적화 스키마.

다음 쿼리를 사용하여 각 컬럼의 현재 압축 및 비압축 크기를 측정할 수 있습니다. 먼저 정렬 키가 없는 초기 스키마 `posts`의 크기를 살펴보겠습니다.

```sql
SELECT name,
   formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
   formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
   round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table = 'posts'
GROUP BY name

┌─name──────────────────┬─compressed_size─┬─uncompressed_size─┬───ratio────┐
│ Body                  │ 46.14 GiB       │ 127.31 GiB        │ 2.76       │
│ Title                 │ 1.20 GiB        │ 2.63 GiB          │ 2.19       │
│ Score                 │ 84.77 MiB       │ 736.45 MiB        │ 8.69       │
│ Tags                  │ 475.56 MiB      │ 1.40 GiB          │ 3.02       │
│ ParentId              │ 210.91 MiB      │ 696.20 MiB        │ 3.3        │
│ Id                    │ 111.17 MiB      │ 736.45 MiB        │ 6.62       │
│ AcceptedAnswerId      │ 81.55 MiB       │ 736.45 MiB        │ 9.03       │
│ ClosedDate            │ 13.99 MiB       │ 517.82 MiB        │ 37.02      │
│ LastActivityDate      │ 489.84 MiB      │ 964.64 MiB        │ 1.97       │
│ CommentCount          │ 37.62 MiB       │ 565.30 MiB        │ 15.03      │
│ OwnerUserId           │ 368.98 MiB      │ 736.45 MiB        │ 2          │
│ AnswerCount           │ 21.82 MiB       │ 622.35 MiB        │ 28.53      │
│ FavoriteCount         │ 280.95 KiB      │ 508.40 MiB        │ 1853.02    │
│ ViewCount             │ 95.77 MiB       │ 736.45 MiB        │ 7.69       │
│ LastEditorUserId      │ 179.47 MiB      │ 736.45 MiB        │ 4.1        │
│ ContentLicense        │ 5.45 MiB        │ 847.92 MiB        │ 155.5      │
│ OwnerDisplayName      │ 14.30 MiB       │ 142.58 MiB        │ 9.97       │
│ PostTypeId            │ 20.93 MiB       │ 565.30 MiB        │ 27         │
│ CreationDate          │ 314.17 MiB      │ 964.64 MiB        │ 3.07       │
│ LastEditDate          │ 346.32 MiB      │ 964.64 MiB        │ 2.79       │
│ LastEditorDisplayName │ 5.46 MiB        │ 124.25 MiB        │ 22.75      │
│ CommunityOwnedDate    │ 2.21 MiB        │ 509.60 MiB        │ 230.94     │
└───────────────────────┴─────────────────┴───────────────────┴────────────┘
```


<details>
   
<summary>compact 파트와 wide 파트에 대한 참고 사항</summary>

`compressed_size` 또는 `uncompressed_size` 값이 `0`으로 표시된다면, 해당 파트의 유형이 `wide`가 아니라 `compact`이기 때문일 수 있습니다. (`system.parts`의 `part_type` 설명 참조: [`system.parts`](/operations/system-tables/parts)).  
파트 형식은 [`min_bytes_for_wide_part`](/operations/settings/merge-tree-settings#min_bytes_for_wide_part) 및 [`min_rows_for_wide_part`](/operations/settings/merge-tree-settings#min_rows_for_wide_part) 설정으로 제어됩니다. 삽입된
데이터로 생성된 파트가 앞서 언급한 설정 값들을 초과하지 않으면 해당 파트는 wide가 아니라 compact가 되며,
`compressed_size` 또는 `uncompressed_size`에 유의미한 값이 표시되지 않습니다.

다음 예제를 통해 살펴봅니다:

```sql title="Query"
-- compact 파트로 구성된 테이블 생성
CREATE TABLE compact (
  number UInt32
)
ENGINE = MergeTree()
ORDER BY number 
AS SELECT * FROM numbers(100000); -- min_bytes_for_wide_part = 10485760 기본값을 초과하기에는 충분히 크지 않음

-- 파트 유형 확인
SELECT table, name, part_type from system.parts where table = 'compact';

-- compact 테이블에 대한 압축/비압축 컬럼 크기 확인
SELECT name,
   formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
   formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
   round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table = 'compact'
GROUP BY name;

-- wide 파트로 구성된 테이블 생성 
CREATE TABLE wide (
  number UInt32
)
ENGINE = MergeTree()
ORDER BY number
SETTINGS min_bytes_for_wide_part=0
AS SELECT * FROM numbers(100000);

-- 파트 유형 확인
SELECT table, name, part_type from system.parts where table = 'wide';

-- wide 테이블에 대한 압축/비압축 크기 확인
SELECT name,
   formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
   formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
   round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table = 'wide'
GROUP BY name;
```

```response title="Response"
   ┌─table───┬─name──────┬─part_type─┐
1. │ compact │ all_1_1_0 │ Compact   │
   └─────────┴───────────┴───────────┘
   ┌─name───┬─compressed_size─┬─uncompressed_size─┬─ratio─┐
1. │ number │ 0.00 B          │ 0.00 B            │   nan │
   └────────┴─────────────────┴───────────────────┴───────┘
   ┌─table─┬─name──────┬─part_type─┐
1. │ wide  │ all_1_1_0 │ Wide      │
   └───────┴───────────┴───────────┘
   ┌─name───┬─compressed_size─┬─uncompressed_size─┬─ratio─┐
1. │ number │ 392.31 KiB      │ 390.63 KiB        │     1 │
   └────────┴─────────────────┴───────────────────┴───────┘
```

</details>

위 예제에서는 압축된 크기와 압축되지 않은 크기를 모두 보여 줍니다. 둘 다 중요합니다. 압축된 크기는 디스크에서 실제로 읽게 되는 양에 해당하며, 이는 쿼리 성능(및 스토리지 비용)을 위해 최소화해야 합니다. 이 데이터는 읽기 전에 압축을 해제해야 합니다. 이때 압축 해제된 데이터의 크기는 사용된 데이터 타입에 따라 달라집니다. 이 크기를 최소화하면 쿼리의 메모리 오버헤드와 쿼리가 처리해야 하는 데이터 양이 줄어들어, 캐시 활용도가 향상되고 궁극적으로 쿼리 시간이 단축됩니다.

> 위 쿼리는 system 데이터베이스의 `columns` 테이블에 의존합니다. 이 데이터베이스는 ClickHouse에서 관리하며, 쿼리 성능 메트릭부터 백그라운드 클러스터 로그에 이르기까지 유용한 정보가 가득한 보물창고와 같습니다. 관심 있는 사용자는 ["System Tables and a Window into the Internals of ClickHouse"](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables) 및 관련 글[[1]](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)[[2]](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)을 참고하기를 권장합니다. 

테이블의 총 크기를 요약하기 위해 위 쿼리를 더 단순화할 수 있습니다.

```sql
SELECT formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
    formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
    round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table = 'posts'

┌─compressed_size─┬─uncompressed_size─┬─ratio─┐
│ 50.16 GiB       │ 143.47 GiB        │  2.86 │
└─────────────────┴───────────────────┴───────┘
```

최적화된 타입과 정렬 키를 사용한 테이블 `posts_v3`에 대해 이 쿼리를 반복 실행하면, 압축 전과 압축 후 크기가 상당히 줄어든 것을 확인할 수 있습니다.

```sql
SELECT
    formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
    formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
    round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE `table` = 'posts_v3'

┌─compressed_size─┬─uncompressed_size─┬─ratio─┐
│ 25.15 GiB       │ 68.87 GiB         │  2.74 │
└─────────────────┴───────────────────┴───────┘
```

컬럼별 세부 내역을 보면, 압축 전에 데이터를 정렬하고 적절한 타입을 사용함으로써 `Body`, `Title`, `Tags`, `CreationDate` 컬럼에서 상당한 저장 공간 절감 효과가 있음을 알 수 있습니다.


```sql
SELECT
    name,
    formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
    formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
    round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE `table` = 'posts_v3'
GROUP BY name

┌─name──────────────────┬─compressed_size─┬─uncompressed_size─┬───ratio─┐
│ Body                  │ 23.10 GiB       │ 63.63 GiB         │    2.75 │
│ Title                 │ 614.65 MiB      │ 1.28 GiB          │    2.14 │
│ Score                 │ 40.28 MiB       │ 227.38 MiB        │    5.65 │
│ Tags                  │ 234.05 MiB      │ 688.49 MiB        │    2.94 │
│ ParentId              │ 107.78 MiB      │ 321.33 MiB        │    2.98 │
│ Id                    │ 159.70 MiB      │ 227.38 MiB        │    1.42 │
│ AcceptedAnswerId      │ 40.34 MiB       │ 227.38 MiB        │    5.64 │
│ ClosedDate            │ 5.93 MiB        │ 9.49 MiB          │     1.6 │
│ LastActivityDate      │ 246.55 MiB      │ 454.76 MiB        │    1.84 │
│ CommentCount          │ 635.78 KiB      │ 56.84 MiB         │   91.55 │
│ OwnerUserId           │ 183.86 MiB      │ 227.38 MiB        │    1.24 │
│ AnswerCount           │ 9.67 MiB        │ 113.69 MiB        │   11.76 │
│ FavoriteCount         │ 19.77 KiB       │ 147.32 KiB        │    7.45 │
│ ViewCount             │ 45.04 MiB       │ 227.38 MiB        │    5.05 │
│ LastEditorUserId      │ 86.25 MiB       │ 227.38 MiB        │    2.64 │
│ ContentLicense        │ 2.17 MiB        │ 57.10 MiB         │   26.37 │
│ OwnerDisplayName      │ 5.95 MiB        │ 16.19 MiB         │    2.72 │
│ PostTypeId            │ 39.49 KiB       │ 56.84 MiB         │ 1474.01 │
│ CreationDate          │ 181.23 MiB      │ 454.76 MiB        │    2.51 │
│ LastEditDate          │ 134.07 MiB      │ 454.76 MiB        │    3.39 │
│ LastEditorDisplayName │ 2.15 MiB        │ 6.25 MiB          │    2.91 │
│ CommunityOwnedDate    │ 824.60 KiB      │ 1.34 MiB          │    1.66 │
└───────────────────────┴─────────────────┴───────────────────┴─────────┘
```


## 적절한 컬럼 압축 코덱 선택하기 \{#choosing-the-right-column-compression-codec\}

컬럼 압축 코덱을 사용하면 각 컬럼을 인코딩하고 압축하는 데 사용되는 알고리즘(및 그 설정)을 변경할 수 있습니다.

인코딩과 압축은 방식은 조금 다르지만 목표는 동일합니다. 바로 데이터 크기를 줄이는 것입니다. 인코딩은 데이터 타입의 특성을 활용하여 함수 기반으로 값들을 변환하는 매핑을 데이터에 적용합니다. 반대로 압축은 바이트 수준에서 데이터를 압축하기 위해 범용 알고리즘을 사용합니다.

일반적으로 인코딩을 먼저 적용한 후 압축을 사용합니다. 서로 다른 인코딩과 압축 알고리즘은 서로 다른 값 분포에서 효과적이므로, 데이터를 이해하는 것이 중요합니다.

ClickHouse는 매우 많은 코덱과 압축 알고리즘을 지원합니다. 아래는 중요도 순으로 정리한 몇 가지 권장 사항입니다:

| Recommendation                                | Reasoning                                                                                                                                                                                                                                                            |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`ZSTD` all the way**                        | `ZSTD` 압축은 가장 뛰어난 압축률을 제공합니다. 대부분의 일반적인 타입에는 `ZSTD(1)`을 기본값으로 사용하는 것이 좋습니다. 숫자 값을 변경하여 더 높은 압축률을 시도할 수 있습니다. 그러나 값이 3을 넘는 경우에는 압축 비용 증가(더 느린 삽입)에 비해 충분한 이점을 얻는 경우가 거의 없습니다.                                                                                         |
| **`Delta` for date and integer sequences**    | `Delta` 기반 코덱은 단조 증가(또는 감소) 시퀀스이거나 연속된 값들 사이의 델타가 작을 때 잘 동작합니다. 보다 구체적으로, 파생값(미분 결과)이 작은 수가 되는 경우 Delta 코덱이 잘 동작합니다. 그렇지 않다면 `DoubleDelta`를 시도해 볼 가치가 있습니다(일반적으로 `Delta`의 1차 파생값이 이미 매우 작은 경우에는 추가 이득이 거의 없습니다). 단조 증가 폭이 일정한 시퀀스는, 예를 들어 DateTime 필드처럼, 더욱 잘 압축됩니다. |
| **`Delta` improves `ZSTD`**                   | `ZSTD`는 델타 데이터에 대해 효과적인 코덱이며, 반대로 델타 인코딩은 `ZSTD` 압축을 향상시킬 수 있습니다. `ZSTD`가 사용되는 경우, 다른 코덱이 추가적인 개선을 제공하는 경우는 드뭅니다.                                                                                                                                                    |
| **`LZ4` over `ZSTD` if possible**             | `LZ4`와 `ZSTD` 간에 유사한 압축률을 얻는다면, 더 빠른 디코딩 속도와 더 적은 CPU 사용량을 제공하는 `LZ4`를 선택하는 것이 좋습니다. 그러나 대부분의 경우 `ZSTD`는 `LZ4`보다 상당히 더 좋은 성능을 발휘합니다. 일부 코덱은 `LZ4`와 조합했을 때, 별도의 코덱 없이 `ZSTD`를 사용하는 경우와 유사한 압축률을 제공하면서 더 빠르게 동작할 수 있습니다. 다만 이는 데이터 특성에 따라 달라지므로 테스트가 필요합니다.            |
| **`T64` for sparse or small ranges**          | `T64`는 희소 데이터이거나 블록 내 값의 범위가 작을 때 효과적일 수 있습니다. 랜덤 숫자에는 `T64` 사용을 피해야 합니다.                                                                                                                                                                                            |
| **`Gorilla` and `T64` for unknown patterns?** | 데이터 패턴이 알려지지 않은 경우, `Gorilla`와 `T64`를 시도해 볼 만합니다.                                                                                                                                                                                                                    |
| **`Gorilla` for gauge data**                  | `Gorilla`는 특히 게이지 측정값(예: 랜덤 스파이크)을 나타내는 부동소수점 데이터에 효과적일 수 있습니다.                                                                                                                                                                                                      |

추가 옵션은 [여기](/sql-reference/statements/create/table#column_compression_codec)를 참고하십시오.

아래 예시에서는 정렬 키와 선형적으로 상관관계가 있을 것이라고 가정하고, `Id`, `ViewCount`, `AnswerCount` 컬럼에 `Delta` 코덱을 지정합니다.

```sql
CREATE TABLE posts_v4
(
        `Id` Int32 CODEC(Delta, ZSTD),
        `PostTypeId` Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
        `AcceptedAnswerId` UInt32,
        `CreationDate` DateTime64(3, 'UTC'),
        `Score` Int32,
        `ViewCount` UInt32 CODEC(Delta, ZSTD),
        `Body` String,
        `OwnerUserId` Int32,
        `OwnerDisplayName` String,
        `LastEditorUserId` Int32,
        `LastEditorDisplayName` String,
        `LastEditDate` DateTime64(3, 'UTC'),
        `LastActivityDate` DateTime64(3, 'UTC'),
        `Title` String,
        `Tags` String,
        `AnswerCount` UInt16 CODEC(Delta, ZSTD),
        `CommentCount` UInt8,
        `FavoriteCount` UInt8,
        `ContentLicense` LowCardinality(String),
        `ParentId` String,
        `CommunityOwnedDate` DateTime64(3, 'UTC'),
        `ClosedDate` DateTime64(3, 'UTC')
)
ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
```

이 컬럼들에 대한 압축 개선 효과는 아래와 같습니다.


```sql
SELECT
    `table`,
    name,
    formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
    formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
    round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE (name IN ('Id', 'ViewCount', 'AnswerCount')) AND (`table` IN ('posts_v3', 'posts_v4'))
GROUP BY
    `table`,
    name
ORDER BY
    name ASC,
    `table` ASC

┌─table────┬─name────────┬─compressed_size─┬─uncompressed_size─┬─ratio─┐
│ posts_v3 │ AnswerCount │ 9.67 MiB        │ 113.69 MiB        │ 11.76 │
│ posts_v4 │ AnswerCount │ 10.39 MiB       │ 111.31 MiB        │ 10.71 │
│ posts_v3 │ Id          │ 159.70 MiB      │ 227.38 MiB        │  1.42 │
│ posts_v4 │ Id          │ 64.91 MiB       │ 222.63 MiB        │  3.43 │
│ posts_v3 │ ViewCount   │ 45.04 MiB       │ 227.38 MiB        │  5.05 │
│ posts_v4 │ ViewCount   │ 52.72 MiB       │ 222.63 MiB        │  4.22 │
└──────────┴─────────────┴─────────────────┴───────────────────┴───────┘

6 rows in set. Elapsed: 0.008 sec
```


### ClickHouse Cloud의 압축 \{#compression-in-clickhouse-cloud\}

ClickHouse Cloud에서는 기본적으로 `ZSTD` 압축 알고리즘(기본값 1)을 사용합니다. 이 알고리즘은 압축 레벨(값이 높을수록 속도가 느려짐)에 따라 압축 속도가 달라질 수 있지만, 압축 해제 시에는 일관되게 빠르다는 점(약 20% 정도의 변동)과 병렬화가 가능하다는 장점이 있습니다. 과거 테스트에 따르면, 이 알고리즘은 대부분 충분히 효과적이며, 코덱과 결합된 `LZ4`보다 더 나은 성능을 보이는 경우도 자주 있습니다. 대부분의 데이터 타입과 정보 분포에 대해 효과적이므로 범용 기본값으로 합리적이며, 별도의 최적화 없이도 초기 압축 품질이 이미 매우 우수한 이유이기도 합니다.