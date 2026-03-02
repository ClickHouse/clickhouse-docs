---
slug: /best-practices/select-data-types
sidebar_position: 10
sidebar_label: '데이터 타입 선택'
title: '데이터 타입 선택'
description: 'ClickHouse에서 데이터 타입을 선택하는 방법을 설명합니다'
keywords: ['data types']
doc_type: 'reference'
---

import NullableColumns from '@site/i18n/ko/docusaurus-plugin-content-docs/current/best-practices/_snippets/_avoid_nullable_columns.md';

ClickHouse의 쿼리 성능의 핵심 이유 중 하나는 효율적인 데이터 압축입니다. 디스크에 저장되는 데이터가 적을수록 I/O 오버헤드가 줄어들어 쿼리 및 INSERT 작업이 더 빨라집니다. ClickHouse의 컬럼 지향 아키텍처는 유사한 데이터를 자연스럽게 인접하게 배치하여 압축 알고리즘과 코덱이 데이터 크기를 크게 줄일 수 있도록 합니다. 이러한 압축 이점을 최대화하려면 적절한 데이터 타입을 신중하게 선택하는 것이 중요합니다.

ClickHouse에서 압축 효율성은 주로 정렬 키(ordering key), 데이터 타입, 코덱이라는 세 가지 요소에 의해 결정되며, 모두 테이블 스키마를 통해 정의됩니다. 최적의 데이터 타입을 선택하면 스토리지와 쿼리 성능 모두에서 즉각적인 개선 효과를 얻을 수 있습니다.

몇 가지 단순한 가이드라인만으로도 스키마를 크게 개선할 수 있습니다:

* **엄격한 타입 사용:** 컬럼에는 항상 올바른 데이터 타입을 선택해야 합니다. 숫자와 날짜 필드는 범용 `String` 타입이 아니라 적절한 숫자 및 날짜 타입을 사용해야 합니다. 이렇게 하면 필터링과 집계 시 의미를 정확하게 보장할 수 있습니다.

* **널 허용 컬럼 피하기:** 널 허용(Nullable) 컬럼은 널 값을 추적하기 위한 별도의 컬럼을 유지해야 하므로 추가 오버헤드를 유발합니다. 비어 있음과 널 상태를 명확히 구분해야 하는 경우에만 `Nullable`을 사용해야 합니다. 그렇지 않은 경우 기본값이나 0에 해당하는 값이면 일반적으로 충분합니다. 이 타입을 필요하지 않은데도 사용하면 안 되는 이유에 대해서는 [Avoid nullable Columns](/best-practices/select-data-types#avoid-nullable-columns)를 참조하십시오.

* **숫자 정밀도 최소화:** 예상되는 데이터 범위를 수용할 수 있는 최소 비트 폭의 숫자 타입을 선택하십시오. 예를 들어 음수 값이 필요 없고 값의 범위가 0–65535에 해당한다면 [UInt16 over Int32](/sql-reference/data-types/int-uint)를 사용하는 것이 좋습니다.

* **날짜와 시간 정밀도 최적화:** 쿼리 요구 사항을 충족하는 가장 낮은 정밀도의 날짜 또는 datetime 타입을 선택하십시오. 날짜 전용 필드에는 `Date` 또는 `Date32`를 사용하고, 밀리초 또는 그보다 더 세밀한 정밀도가 반드시 필요하지 않다면 `DateTime64`보다 `DateTime`을 사용하는 것이 좋습니다.

* **LowCardinality 및 특수 타입 활용:** 고유 값이 대략 10,000개 미만인 컬럼에는 LowCardinality 타입을 사용하여 딕셔너리 인코딩을 통해 스토리지 사용량을 크게 줄일 수 있습니다. 마찬가지로 컬럼 값이 엄격하게 고정 길이 문자열(예: 국가 코드나 통화 코드)인 경우에만 `FixedString`을 사용하고, 가능한 값의 집합이 유한한 컬럼에는 효율적인 저장과 내장 데이터 검증을 위해 `Enum` 타입 사용을 권장합니다.

* **데이터 검증을 위한 Enum:** `Enum` 타입은 열거형 타입을 효율적으로 인코딩하는 데 사용할 수 있습니다. Enum은 저장해야 하는 고유 값의 개수에 따라 8비트 또는 16비트가 될 수 있습니다. INSERT 시 검증(선언되지 않은 값은 거부됨)이 필요하거나 Enum 값의 자연스러운 순서를 활용하는 쿼리를 수행하려는 경우 이를 사용하는 방안을 고려하십시오. 예를 들어 피드백 컬럼에 사용자 응답을 `Enum(&#39;:(&#39; = 1, &#39;:|&#39; = 2, &#39;:)&#39; = 3)`과 같이 저장하는 경우를 생각해 볼 수 있습니다.


## 예시 \{#example\}

ClickHouse는 타입 최적화를 간소화하기 위한 내장 도구를 제공합니다. 예를 들어, 스키마 추론을 통해 초기 데이터 타입을 자동으로 식별할 수 있습니다. Parquet 형식으로 공개된 Stack Overflow 데이터셋을 생각해 보십시오. [`DESCRIBE`](/sql-reference/statements/describe-table) 명령을 사용해 간단한 스키마 추론을 실행하면, 초기 비최적화 스키마를 얻을 수 있습니다.

:::note
기본적으로 ClickHouse는 이를 동일한 널 허용 타입으로 매핑합니다. 스키마는 일부 행만을 샘플링한 것에 기반하기 때문에 이러한 방식이 더 바람직합니다.
:::

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')
SETTINGS describe_compact_output = 1

┌─name───────────────────────┬─type──────────────────────────────┐
│ Id                         │ Nullable(Int64)                   │
│ PostTypeId                 │ Nullable(Int64)                   │
│ AcceptedAnswerId           │ Nullable(Int64)                   │
│ CreationDate               │ Nullable(DateTime64(3, 'UTC'))    │
│ Score                      │ Nullable(Int64)                   │
│ ViewCount                  │ Nullable(Int64)                   │
│ Body                       │ Nullable(String)                  │
│ OwnerUserId                │ Nullable(Int64)                   │
│ OwnerDisplayName           │ Nullable(String)                  │
│ LastEditorUserId           │ Nullable(Int64)                   │
│ LastEditorDisplayName      │ Nullable(String)                  │
│ LastEditDate               │ Nullable(DateTime64(3, 'UTC'))    │
│ LastActivityDate           │ Nullable(DateTime64(3, 'UTC'))    │
│ Title                      │ Nullable(String)                  │
│ Tags                       │ Nullable(String)                  │
│ AnswerCount                │ Nullable(Int64)                   │
│ CommentCount               │ Nullable(Int64)                   │
│ FavoriteCount              │ Nullable(Int64)                   │
│ ContentLicense             │ Nullable(String)                  │
│ ParentId                   │ Nullable(String)                  │
│ CommunityOwnedDate         │ Nullable(DateTime64(3, 'UTC'))    │
│ ClosedDate                 │ Nullable(DateTime64(3, 'UTC'))    │
└────────────────────────────┴───────────────────────────────────┘

22 rows in set. Elapsed: 0.130 sec.
```

:::note
아래에서는 glob 패턴인 *.parquet을 사용하여 stackoverflow/parquet/posts 디렉터리의 모든 파일을 읽습니다.
:::

앞에서 사용한 간단한 규칙을 `posts` 테이블에 적용하면 각 컬럼에 대해 최적의 타입을 식별할 수 있습니다.


| 컬럼                      | 숫자형인지 여부 | 최솟값, 최댓값                                                     | 고유 값 수   | Null 값 포함 여부 | 주석                                                                                | 최적화된 타입                                                                                                                                                      |
| ----------------------- | -------- | ------------------------------------------------------------ | -------- | ------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PostTypeId`            | 예        | 1, 8                                                         | 8        | 아니요          |                                                                                   | `Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8)` |
| `AcceptedAnswerId`      | 예        | 0, 78285170                                                  | 12282094 | 예            | Null과 0 값을 구분합니다                                                                  | UInt32                                                                                                                                                       |
| `CreationDate`          | 아니요      | 2008-07-31 21:42:52.667000000, 2024-03-31 23:59:17.697000000 | *        | 아니요          | 밀리초 단위 정밀도가 필요하지 않으므로 DateTime을 사용합니다                                             | DateTime                                                                                                                                                     |
| `Score`                 | 예        | -217, 34970                                                  | 3236     | 아니요          |                                                                                   | Int32                                                                                                                                                        |
| `ViewCount`             | 예        | 2, 13962748                                                  | 170867   | 아니요          |                                                                                   | UInt32                                                                                                                                                       |
| `Body`                  | 아니요      | -                                                            | *        | 아니요          |                                                                                   | String                                                                                                                                                       |
| `OwnerUserId`           | 예        | -1, 4056915                                                  | 6256237  | 예            |                                                                                   | Int32                                                                                                                                                        |
| `OwnerDisplayName`      | 아니요      | -                                                            | 181251   | 예            | NULL 값을 빈 문자열로 간주합니다                                                              | String                                                                                                                                                       |
| `LastEditorUserId`      | 예        | -1, 9999993                                                  | 1104694  | 예            | 0은 사용되지 않는 값이므로 NULL 값을 나타내는 데 사용할 수 있습니다                                         | Int32                                                                                                                                                        |
| `LastEditorDisplayName` | 아니요      | *                                                            | 70952    | 예            | NULL 값을 빈 문자열로 간주합니다. LowCardinality를 테스트했지만 별다른 이점이 없었습니다                        | String                                                                                                                                                       |
| `LastEditDate`          | 아니요      | 2008-08-01 13:24:35.051000000, 2024-04-06 21:01:22.697000000 | -        | 아니요          | 밀리초 수준의 정밀도는 필요하지 않으므로 DateTime을 사용합니다                                            | DateTime                                                                                                                                                     |
| `LastActivityDate`      | 아니요      | 2008-08-01 12:19:17.417000000, 2024-04-06 21:01:22.697000000 | *        | 아니요          | 밀리초 수준의 정밀도는 필요하지 않으므로 DateTime을 사용합니다                                            | DateTime                                                                                                                                                     |
| `Title`                 | 아니요      | -                                                            | *        | 아니요          | NULL 값을 빈 문자열로 간주합니다                                                              | String                                                                                                                                                       |
| `Tags`                  | 아니요      | -                                                            | *        | 아니요          | Null을 빈 문자열로 처리합니다                                                                | String                                                                                                                                                       |
| `AnswerCount`           | 예        | 0, 518                                                       | 216      | 아니요          | Null과 0을 동일하게 처리합니다                                                               | UInt16                                                                                                                                                       |
| `CommentCount`          | 예        | 0, 135                                                       | 100      | 아니요          | Null과 0을 동일하게 처리합니다                                                               | UInt8                                                                                                                                                        |
| `FavoriteCount`         | 예        | 0, 225                                                       | 6        | 예            | Null과 0을 동일하게 처리합니다                                                               | UInt8                                                                                                                                                        |
| `ContentLicense`        | 아니요      | -                                                            | 3        | 아니요          | LowCardinality가 FixedString보다 성능이 더 우수합니다                                         | LowCardinality(String)                                                                                                                                       |
| `ParentId`              | 아니요      | *                                                            | 20696028 | 예            | Null을 빈 문자열로 처리합니다                                                                | String                                                                                                                                                       |
| `CommunityOwnedDate`    | 아니요      | 2008-08-12 04:59:35.017000000, 2024-04-01 05:36:41.380000000 | -        | 예            | Null 값에는 기본값으로 1970-01-01을 사용하는 것이 좋습니다. 밀리초 단위 정밀도가 필요하지 않으므로 DateTime을 사용합니다    | DateTime                                                                                                                                                     |
| `ClosedDate`            | 아니요      | 2008-09-04 20:56:44, 2024-04-06 18:49:25.393000000           | *        | 예            | NULL 값의 기본값으로 1970-01-01을 사용하는 것을 권장합니다. 밀리초 수준의 정밀도가 필요하지 않으므로 DateTime을 사용하십시오. | DateTime                                                                                                                                                     |

:::note Tip
컬럼의 타입을 식별하려면 해당 컬럼의 숫자 범위와 고유 값 개수를 파악해야 합니다. 모든 컬럼의 범위와 서로 다른 값의 개수를 찾기 위해, 간단한 쿼리 `SELECT * APPLY min, * APPLY max, * APPLY uniq FROM table FORMAT Vertical`를 사용할 수 있습니다. 이는 비용이 많이 들 수 있으므로, 데이터의 작은 부분 집합에 대해 실행할 것을 권장합니다.
:::

그 결과 (타입 관점에서) 다음과 같은 최적화된 스키마를 얻을 수 있습니다:

```sql
CREATE TABLE posts
(
   Id Int32,
   PostTypeId Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 
   'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
   AcceptedAnswerId UInt32,
   CreationDate DateTime,
   Score Int32,
   ViewCount UInt32,
   Body String,
   OwnerUserId Int32,
   OwnerDisplayName String,
   LastEditorUserId Int32,
   LastEditorDisplayName String,
   LastEditDate DateTime,
   LastActivityDate DateTime,
   Title String,
   Tags String,
   AnswerCount UInt16,
   CommentCount UInt8,
   FavoriteCount UInt8,
   ContentLicense LowCardinality(String),
   ParentId String,
   CommunityOwnedDate DateTime,
   ClosedDate DateTime
)
ENGINE = MergeTree
ORDER BY tuple()
```


## 널 허용 컬럼 사용을 피하십시오 \{#avoid-nullable-columns\}

<NullableColumns />