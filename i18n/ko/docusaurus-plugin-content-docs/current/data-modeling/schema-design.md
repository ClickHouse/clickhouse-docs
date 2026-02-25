---
slug: /data-modeling/schema-design
title: '스키마 설계'
description: '쿼리 성능 최적화를 위한 ClickHouse 스키마 최적화'
keywords: ['스키마', '스키마 설계', '쿼리 최적화']
doc_type: 'guide'
---

import stackOverflowSchema from '@site/static/images/data-modeling/stackoverflow-schema.png';
import schemaDesignIndices from '@site/static/images/data-modeling/schema-design-indices.png';
import Image from '@theme/IdealImage';

효율적인 스키마 설계에 대한 이해는 ClickHouse 성능 최적화의 핵심이며, 여기에는 종종 트레이드오프가 수반되는 여러 가지 설계 선택이 포함됩니다. 최적의 설계 방식은 처리되는 쿼리뿐만 아니라 데이터 갱신 빈도, 지연 시간 요구사항, 데이터 볼륨과 같은 요소에 따라 달라집니다. 이 가이드는 ClickHouse 성능을 최적화하기 위한 스키마 설계 모범 사례와 데이터 모델링 기법을 개괄적으로 소개합니다.


## Stack Overflow 데이터세트 \{#stack-overflow-dataset\}

이 가이드의 예제에서는 Stack Overflow 데이터세트의 일부를 사용합니다. 이 데이터세트에는 2008년부터 2024년 4월까지 Stack Overflow에서 발생한 모든 게시물, 투표, 사용자, 댓글 및 배지가 포함되어 있습니다. 이 데이터는 아래 스키마에 따라 Parquet 형식으로 `s3://datasets-documentation/stackoverflow/parquet/` S3 버킷에서 제공됩니다:

> 표시된 기본 키와 관계는 제약 조건으로 강제되지 않습니다(Parquet는 테이블 형식이 아니라 파일 형식이므로), 데이터 간의 관계와 데이터가 가지는 고유 키를 설명하기 위한 목적으로만 제시되어 있습니다.

<Image img={stackOverflowSchema} size="lg" alt="Stack Overflow 스키마"/>

<br />

Stack Overflow 데이터세트에는 서로 연관된 여러 테이블이 포함되어 있습니다. 어떤 데이터 모델링 작업에서도 먼저 기본 테이블을 로드하는 데 집중할 것을 권장합니다. 이 기본 테이블은 반드시 가장 큰 테이블일 필요는 없으며, 분석 쿼리가 가장 많이 실행될 것으로 예상되는 테이블이어야 합니다. 이렇게 하면 주요 ClickHouse 개념과 타입에 익숙해질 수 있으며, 특히 주로 OLTP 환경에 익숙한 경우에 중요합니다. 이 테이블은 추가 테이블이 더해지면서 ClickHouse 기능을 충분히 활용하고 최적의 성능을 얻기 위해 재모델링이 필요할 수 있습니다.

위 스키마는 이 가이드의 목적상 의도적으로 최적화되지 않은 상태입니다.

## 초기 스키마 설정 \{#establish-initial-schema\}

`posts` 테이블이 대부분의 분석 쿼리 대상이 되므로, 이 테이블의 스키마를 먼저 설정하는 데 집중합니다. 이 데이터는 연도별 하나의 파일로 저장되어 있으며, 공개 S3 버킷 `s3://datasets-documentation/stackoverflow/parquet/posts/*.parquet` 에서 제공됩니다.

> Parquet 형식의 S3 데이터 로딩은 ClickHouse로 데이터를 적재하는 가장 일반적이면서도 권장되는 방법입니다. ClickHouse는 Parquet 처리에 최적화되어 있으며, S3에서 초당 수천만 행을 읽고 삽입할 수 있습니다.

ClickHouse는 데이터 세트의 타입을 자동으로 식별하는 스키마 추론 기능을 제공합니다. 이 기능은 Parquet를 포함한 모든 데이터 형식을 지원합니다. 이 기능을 활용하여 s3 table function과 [`DESCRIBE`](/sql-reference/statements/describe-table) 명령을 통해 데이터에 대한 ClickHouse 타입을 식별할 수 있습니다. 아래 예시에서는 `stackoverflow/parquet/posts` 폴더의 모든 파일을 읽기 위해 glob 패턴 `*.parquet` 를 사용합니다.

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')
SETTINGS describe_compact_output = 1

┌─name──────────────────┬─type───────────────────────────┐
│ Id                    │ Nullable(Int64)               │
│ PostTypeId            │ Nullable(Int64)               │
│ AcceptedAnswerId      │ Nullable(Int64)               │
│ CreationDate          │ Nullable(DateTime64(3, 'UTC')) │
│ Score                 │ Nullable(Int64)               │
│ ViewCount             │ Nullable(Int64)               │
│ Body                  │ Nullable(String)              │
│ OwnerUserId           │ Nullable(Int64)               │
│ OwnerDisplayName      │ Nullable(String)              │
│ LastEditorUserId      │ Nullable(Int64)               │
│ LastEditorDisplayName │ Nullable(String)              │
│ LastEditDate          │ Nullable(DateTime64(3, 'UTC')) │
│ LastActivityDate      │ Nullable(DateTime64(3, 'UTC')) │
│ Title                 │ Nullable(String)              │
│ Tags                  │ Nullable(String)              │
│ AnswerCount           │ Nullable(Int64)               │
│ CommentCount          │ Nullable(Int64)               │
│ FavoriteCount         │ Nullable(Int64)               │
│ ContentLicense        │ Nullable(String)              │
│ ParentId              │ Nullable(String)              │
│ CommunityOwnedDate    │ Nullable(DateTime64(3, 'UTC')) │
│ ClosedDate            │ Nullable(DateTime64(3, 'UTC')) │
└───────────────────────┴────────────────────────────────┘
```

> [s3 table function](/sql-reference/table-functions/s3)을 사용하면 S3에 있는 데이터를 ClickHouse에서 in-place로 직접 조회할 수 있습니다. 이 함수는 ClickHouse가 지원하는 모든 파일 포맷과 호환됩니다.

이는 초기 비최적화된 스키마를 제공합니다. 기본적으로 ClickHouse는 이를 대응하는 널 허용(Nullable) 타입에 매핑합니다. 간단한 `CREATE EMPTY AS SELECT` 명령을 사용하여 이러한 타입으로 ClickHouse 테이블을 생성할 수 있습니다.

```sql
CREATE TABLE posts
ENGINE = MergeTree
ORDER BY () EMPTY AS
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')
```

몇 가지 중요한 사항이 있습니다.

이 명령을 실행한 후 `posts` 테이블은 비어 있습니다. 아직 데이터가 로드되지 않았습니다.
테이블 엔진으로 MergeTree를 지정했습니다. MergeTree는 ClickHouse에서 가장 일반적으로 사용하게 될 테이블 엔진입니다. ClickHouse 도구 상자에서 사용하는 다용도 도구로, PB 단위의 데이터를 처리할 수 있으며 대부분의 분석용 워크로드를 처리합니다. CDC처럼 효율적인 업데이트를 지원해야 하는 사용 사례를 위해 사용할 수 있는 다른 테이블 엔진들도 있습니다.

`ORDER BY ()` 절은 인덱스가 없다는 것, 더 구체적으로는 데이터에 순서가 없다는 것을 의미합니다. 이에 대해서는 나중에 더 자세히 설명합니다. 지금은 모든 쿼리가 선형 스캔을 필요로 한다는 점만 기억하면 됩니다.

테이블이 생성되었는지 확인하려면:


```sql
SHOW CREATE TABLE posts

CREATE TABLE posts
(
        `Id` Nullable(Int64),
        `PostTypeId` Nullable(Int64),
        `AcceptedAnswerId` Nullable(Int64),
        `CreationDate` Nullable(DateTime64(3, 'UTC')),
        `Score` Nullable(Int64),
        `ViewCount` Nullable(Int64),
        `Body` Nullable(String),
        `OwnerUserId` Nullable(Int64),
        `OwnerDisplayName` Nullable(String),
        `LastEditorUserId` Nullable(Int64),
        `LastEditorDisplayName` Nullable(String),
        `LastEditDate` Nullable(DateTime64(3, 'UTC')),
        `LastActivityDate` Nullable(DateTime64(3, 'UTC')),
        `Title` Nullable(String),
        `Tags` Nullable(String),
        `AnswerCount` Nullable(Int64),
        `CommentCount` Nullable(Int64),
        `FavoriteCount` Nullable(Int64),
        `ContentLicense` Nullable(String),
        `ParentId` Nullable(String),
        `CommunityOwnedDate` Nullable(DateTime64(3, 'UTC')),
        `ClosedDate` Nullable(DateTime64(3, 'UTC'))
)
ENGINE = MergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}')
ORDER BY tuple()
```

초기 스키마를 정의했으므로 이제 `INSERT INTO SELECT` 구문과 S3 테이블 함수를 사용하여 데이터를 읽어와 채울 수 있습니다. 다음 예시는 8코어 ClickHouse Cloud 인스턴스에서 약 2분 만에 `posts` 데이터를 로드합니다.

```sql
INSERT INTO posts SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 148.140 sec. Processed 59.82 million rows, 38.07 GB (403.80 thousand rows/s., 257.00 MB/s.)
```

> 위 쿼리는 6천만 행을 로드합니다. ClickHouse 입장에서는 작은 규모이지만, 인터넷 연결이 느린 사용자는 데이터의 일부만 로드하기를 원할 수 있습니다. 이는 로드할 연도를 glob 패턴으로 단순히 지정하는 것만으로도 가능합니다. 예: `https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2008.parquet` 또는 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/{2008, 2009}.parquet`. glob 패턴을 사용하여 파일의 부분 집합만 대상으로 지정하는 방법은 [여기](/sql-reference/table-functions/file#globs-in-path)를 참조하십시오.


## Optimizing Types \{#optimizing-types\}

ClickHouse 쿼리 성능의 비결 중 하나는 압축입니다.

디스크에 저장되는 데이터가 적을수록 I/O가 줄어들어 쿼리와 INSERT가 더 빨라집니다. 대부분의 경우 어떤 압축 알고리즘이든 CPU 오버헤드는 IO 감소 효과에 의해 상쇄됩니다. 따라서 ClickHouse 쿼리를 빠르게 만들기 위해 작업할 때는 데이터 압축을 향상시키는 것을 가장 먼저 고려해야 합니다.

> ClickHouse가 데이터를 매우 잘 압축하는 이유에 대해서는 [이 글](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)을 참고하십시오. 요약하면, 컬럼 지향 데이터베이스이기 때문에 값이 컬럼 단위로 기록됩니다. 이 값들이 정렬되어 있다면 동일한 값들이 서로 인접하게 됩니다. 압축 알고리즘은 이러한 연속적인 데이터 패턴을 활용합니다. 여기에 더해, ClickHouse는 추가로 압축 기법을 튜닝할 수 있도록 코덱과 세분화된 데이터 타입을 제공합니다.

ClickHouse에서 압축은 세 가지 주요 요인의 영향을 받습니다: ordering key, 데이터 타입, 사용되는 코덱입니다. 이 모든 것은 스키마를 통해 구성됩니다.

압축 및 쿼리 성능에서 가장 큰 초기 개선은 간단한 타입 최적화 과정을 통해 얻을 수 있습니다. 스키마를 최적화하기 위해 몇 가지 간단한 규칙을 적용할 수 있습니다:

- **엄격한 타입 사용** - 초기 스키마에서는 명백히 숫자형인 많은 컬럼에 `String`을 사용했습니다. 올바른 타입을 사용하면 필터링 및 집계 시 기대하는 의미론이 보장됩니다. 이는 Parquet 파일에서 올바르게 제공된 날짜 타입에도 동일하게 적용됩니다.
- **널 허용 컬럼 지양** - 기본적으로 위의 컬럼들은 Null로 가정되었습니다. 널 허용(Nullable) 타입은 쿼리에서 빈 값과 Null 값을 구분할 수 있도록 합니다. 이는 `UInt8` 타입의 별도 컬럼을 생성합니다. 사용자가 널 허용 컬럼을 사용할 때마다 이 추가 컬럼을 처리해야 합니다. 이는 추가 저장 공간을 사용하게 하고, 거의 항상 쿼리 성능에 부정적인 영향을 줍니다. 특정 타입의 기본 빈 값과 Null 사이에 의미 있는 차이가 있을 때만 Nullable을 사용하십시오. 예를 들어, `ViewCount` 컬럼에서 빈 값에 대해 0을 사용하는 것은 대부분의 쿼리에 충분하며 결과에 영향을 주지 않을 것입니다. 빈 값을 다르게 처리해야 한다면, 필터를 사용해 쿼리에서 제외하는 방식도 자주 사용할 수 있습니다.
- **숫자 타입에는 최소 정밀도 사용** - ClickHouse는 다양한 범위와 정밀도를 위해 설계된 여러 숫자 타입을 제공합니다. 컬럼을 표현하는 데 사용되는 비트 수를 항상 최소화하는 것이 좋습니다. 예를 들어, 다양한 크기의 정수(`Int16` 등)뿐 아니라 최소값이 0인 부호 없는 타입도 제공합니다. 이는 컬럼에 더 적은 비트를 사용하도록 할 수 있습니다(예: `UInt16`의 최대값은 65535로, `Int16`의 두 배입니다). 가능하다면 더 큰 부호 있는 타입보다 이러한 타입을 우선적으로 사용하십시오.
- **날짜 타입에 대한 최소 정밀도 사용** - ClickHouse는 여러 날짜 및 datetime 타입을 지원합니다. 순수한 날짜 저장에는 `Date`와 `Date32`를 사용할 수 있으며, 후자는 더 많은 비트를 사용하는 대신 더 넓은 날짜 범위를 지원합니다. `DateTime`과 `DateTime64`는 날짜-시간을 지원합니다. `DateTime`은 초 단위까지의 정밀도를 가지며 32비트를 사용합니다. 이름에서 알 수 있듯이 `DateTime64`는 64비트를 사용하지만 나노초 단위까지 지원합니다. 항상 쿼리에서 허용 가능한 가장 낮은 정밀도의 버전을 선택하여 필요한 비트 수를 최소화하십시오.
- **LowCardinality 사용** - 고유 값의 개수가 적은 숫자, 문자열, `Date` 또는 `DateTime` 컬럼은 `LowCardinality` 타입을 사용해 인코딩할 수 있습니다. 이는 값을 딕셔너리로 인코딩하여 디스크 상의 크기를 줄입니다. 고유 값이 1만 개 미만인 컬럼에 대해 고려하십시오.
- FixedString for special cases - 길이가 고정된 문자열은 `FixedString` 타입으로 인코딩할 수 있습니다(예: 언어 코드 및 통화 코드). 이는 데이터의 길이가 정확히 N바이트일 때 효율적입니다. 그 밖의 경우에는 효율성을 떨어뜨릴 가능성이 크며, `LowCardinality`를 사용하는 것이 더 좋습니다.
- **데이터 검증을 위한 Enum 사용** - `Enum` 타입은 열거형 타입을 효율적으로 인코딩하는 데 사용할 수 있습니다. Enum은 저장해야 하는 고유 값의 개수에 따라 8비트 또는 16비트가 될 수 있습니다. INSERT 시 관련 검증(선언되지 않은 값이 거부됨)이 필요하거나 Enum 값의 자연스러운 순서를 활용하는 쿼리를 수행하려는 경우 사용을 고려하십시오. 예를 들어, 사용자 응답을 포함하는 피드백 컬럼이 `Enum(':(' = 1, ':|' = 2, ':)' = 3)` 형태라고 가정해 볼 수 있습니다.

> 팁: 모든 컬럼의 값 범위와 고유 값의 개수를 확인하려면 `SELECT * APPLY min, * APPLY  max, * APPLY uniq FROM table FORMAT Vertical`과 같은 간단한 쿼리를 사용할 수 있습니다. 이 쿼리는 비용이 많이 들 수 있으므로 더 작은 데이터 부분 집합에 대해 수행하는 것이 좋습니다. 이 쿼리가 정확한 결과를 제공하려면 숫자가 `String`이 아니라 최소한 숫자 타입으로 정의되어 있어야 합니다.

이러한 간단한 규칙을 posts 테이블에 적용하면 각 컬럼에 대한 최적의 타입을 식별할 수 있습니다:

| 컬럼                      | 숫자형 여부 | 최소값, 최대값                                                     | 고유 값 개수  | Null 값 여부 | 주석                                                                                   | 최적화된 데이터 타입                                                                                                                                                  |
| ----------------------- | ------ | ------------------------------------------------------------ | -------- | --------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PostTypeId`            | 예      | 1, 8                                                         | 8        | 아니요       |                                                                                      | `Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8)` |
| `AcceptedAnswerId`      | 예      | 0, 78285170                                                  | 12282094 | 예         | Null 값을 0과 구분합니다                                                                     | UInt32                                                                                                                                                       |
| `CreationDate`          | 아니요    | 2008-07-31 21:42:52.667000000, 2024-03-31 23:59:17.697000000 | *        | 아니요       | 밀리초 단위 정밀도가 필요하지 않으므로 DateTime을 사용합니다                                                | DateTime                                                                                                                                                     |
| `Score`                 | 예      | -217, 34970                                                  | 3236     | 아니요       |                                                                                      | Int32                                                                                                                                                        |
| `ViewCount`             | 예      | 2, 13962748                                                  | 170867   | 아니요       |                                                                                      | UInt32                                                                                                                                                       |
| `Body`                  | 아니요    | -                                                            | *        | 아니요       |                                                                                      | String                                                                                                                                                       |
| `OwnerUserId`           | 예      | -1, 4056915                                                  | 6256237  | 예         |                                                                                      | Int32                                                                                                                                                        |
| `OwnerDisplayName`      | 아니요    | -                                                            | 181251   | 예         | Null 값은 빈 문자열로 처리합니다                                                                 | String                                                                                                                                                       |
| `LastEditorUserId`      | 예      | -1, 9999993                                                  | 1104694  | 예         | 0은 사용되지 않는 값이므로 Null 값을 나타내는 값으로 사용할 수 있습니다                                          | Int32                                                                                                                                                        |
| `LastEditorDisplayName` | 아니요    | *                                                            | 70952    | 예         | Null 값은 빈 문자열로 처리합니다. LowCardinality를 테스트했지만 이점이 없었습니다                               | String                                                                                                                                                       |
| `LastEditDate`          | 아니요    | 2008-08-01 13:24:35.051000000, 2024-04-06 21:01:22.697000000 | -        | 아니요       | 밀리초 단위 정밀도가 필요하지 않으므로 DateTime을 사용합니다                                                | DateTime                                                                                                                                                     |
| `LastActivityDate`      | 아니요    | 2008-08-01 12:19:17.417000000, 2024-04-06 21:01:22.697000000 | *        | 아니요       | 밀리초 단위 정밀도가 필요하지 않으므로 DateTime을 사용합니다                                                | DateTime                                                                                                                                                     |
| `Title`                 | 아니요    | -                                                            | *        | 아니요       | Null 값은 빈 문자열로 처리합니다                                                                 | String                                                                                                                                                       |
| `Tags`                  | 아니요    | -                                                            | *        | 아니요       | Null을 빈 문자열로 처리합니다                                                                   | String                                                                                                                                                       |
| `AnswerCount`           | 예      | 0, 518                                                       | 216      | 아니요       | Null과 0을 같게 처리합니다                                                                    | UInt16                                                                                                                                                       |
| `CommentCount`          | 예      | 0, 135                                                       | 100      | 아니요       | Null과 0을 같게 처리합니다                                                                    | UInt8                                                                                                                                                        |
| `FavoriteCount`         | 예      | 0, 225                                                       | 6        | 예         | Null과 0을 같게 처리합니다                                                                    | UInt8                                                                                                                                                        |
| `ContentLicense`        | 아니요    | -                                                            | 3        | 아니요       | LowCardinality가 FixedString보다 성능이 더 우수합니다                                            | LowCardinality(String)                                                                                                                                       |
| `ParentId`              | 아니요    | *                                                            | 20696028 | 예         | Null을 빈 문자열로 처리합니다                                                                   | String                                                                                                                                                       |
| `CommunityOwnedDate`    | 아니요    | 2008-08-12 04:59:35.017000000, 2024-04-01 05:36:41.380000000 | -        | 예         | Null 값에는 기본값 1970-01-01을 사용하는 것이 좋습니다. 밀리초 단위 정밀도가 필요하지 않으므로 DateTime을 사용합니다         | DateTime                                                                                                                                                     |
| `ClosedDate`            | 아니요    | 2008-09-04 20:56:44, 2024-04-06 18:49:25.393000000           | *        | 예         | NULL 값의 기본값으로 1970-01-01을 사용하는 것을 고려할 수 있습니다. 밀리초 단위 정밀도가 필요하지 않다면 DateTime을 사용하십시오. | DateTime                                                                                                                                                     |

<br />

위의 내용을 바탕으로 스키마는 다음과 같습니다:

```sql
CREATE TABLE posts_v2
(
   `Id` Int32,
   `PostTypeId` Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
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
COMMENT 'Optimized types'
```

이전 테이블에서 데이터를 읽어 이 테이블에 삽입하는 간단한 `INSERT INTO SELECT` 문으로 이를 채울 수 있습니다:

```sql
INSERT INTO posts_v2 SELECT * FROM posts

0 rows in set. Elapsed: 146.471 sec. Processed 59.82 million rows, 83.82 GB (408.40 thousand rows/s., 572.25 MB/s.)
```

새 스키마에서는 null 값을 전혀 유지하지 않습니다. 위의 INSERT 문은 이러한 값을 각 타입의 기본값으로 암묵적으로 변환합니다. 정수형은 0으로, 문자열은 빈 값으로 변환됩니다. 또한 ClickHouse는 모든 숫자형 값을 대상 정밀도로 자동 변환합니다.
ClickHouse의 기본(정렬) 키
OLTP 데이터베이스를 사용하던 사용자는 ClickHouse에서 이에 해당하는 개념을 찾는 경우가 많습니다.


## 정렬 키 선택하기 \{#choosing-an-ordering-key\}

ClickHouse가 주로 사용되는 규모에서는 메모리와 디스크 효율성이 매우 중요합니다. 데이터는 ClickHouse 테이블에 파트(parts)라고 하는 청크로 기록되며, 백그라운드에서 파트를 머지(merge)하는 규칙이 적용됩니다. ClickHouse에서 각 파트는 자체 기본 인덱스(primary index)를 가집니다. 파트가 머지되면, 머지된 파트의 기본 인덱스도 함께 머지됩니다. 하나의 파트에 대한 기본 인덱스는 행 그룹마다 하나의 인덱스 엔트리를 가지며, 이 기법을 희소 인덱싱(sparse indexing)이라고 합니다.

<Image img={schemaDesignIndices} size="md" alt="Sparse Indexing in ClickHouse"/>

ClickHouse에서 선택한 키는 인덱스뿐만 아니라 데이터가 디스크에 기록되는 순서도 결정합니다. 이로 인해 압축 수준에 큰 영향을 줄 수 있고, 이는 다시 쿼리 성능에도 영향을 미칩니다. 대부분의 컬럼 값이 연속적인 순서로 기록되도록 하는 정렬 키를 선택하면, 선택된 압축 알고리즘(및 코덱)이 데이터를 더 효과적으로 압축할 수 있습니다.

> 테이블의 모든 컬럼은 지정된 정렬 키의 값에 따라, 해당 컬럼이 키에 포함되었는지 여부와 상관없이 정렬됩니다. 예를 들어 `CreationDate`가 키로 사용되는 경우, 다른 모든 컬럼의 값 순서는 `CreationDate` 컬럼 값의 순서에 대응하게 됩니다. 여러 개의 정렬 키를 지정할 수 있으며, 이는 `SELECT` 쿼리에서 `ORDER BY` 절이 동작하는 것과 동일한 의미로 정렬됩니다.

정렬 키를 선택하는 데 도움이 되는 몇 가지 간단한 규칙을 적용할 수 있습니다. 아래 규칙들은 서로 충돌할 수 있으므로, 나열된 순서대로 고려하는 것이 좋습니다. 이 과정을 통해 여러 개의 키를 도출할 수 있으며, 일반적으로 4–5개면 충분합니다:

- 일반적인 필터 조건과 잘 맞는 컬럼을 선택합니다. 어떤 컬럼이 `WHERE` 절에서 자주 사용된다면, 사용 빈도가 낮은 컬럼보다 이러한 컬럼을 키에 포함하는 것을 우선시합니다.
필터링 시 전체 행의 큰 비율을 배제하는 데 도움이 되는 컬럼을 선호하면, 읽어야 하는 데이터 양을 줄일 수 있습니다.
- 테이블의 다른 컬럼과 높은 상관관계를 가질 가능성이 있는 컬럼을 선호합니다. 이렇게 하면 이러한 값들도 연속적으로 저장되어 압축 효율이 향상됩니다.
정렬 키에 포함된 컬럼에 대한 `GROUP BY` 및 `ORDER BY` 연산은 더 메모리 효율적으로 수행될 수 있습니다.

정렬 키에 사용할 컬럼 부분 집합을 식별했다면, 이 컬럼들을 특정 순서로 선언해야 합니다. 이 순서는 쿼리에서 보조 키 컬럼에 대한 필터링 효율성과 테이블 데이터 파일의 압축 비율 모두에 상당한 영향을 줄 수 있습니다. 일반적으로는 카디널리티가 낮은 것부터 높은 것 순으로 키를 나열하는 것이 가장 좋습니다. 다만 정렬 키에서 뒤에 나오는 컬럼에 대한 필터링은 앞에 나오는 컬럼보다 비효율적이라는 점과 균형을 맞추어야 합니다. 이러한 동작을 균형 있게 고려하고, 접근 패턴을 감안하며(무엇보다도 다양한 변형을 테스트하는 것이 중요합니다).

### 예시 \{#example\}

위의 가이드라인을 `posts` 테이블에 적용해 보면, 사용자가 날짜와 게시물 유형으로 필터링하는 분석을 수행한다고 가정합니다. 예를 들어:

「지난 3개월 동안 댓글이 가장 많이 달린 질문은 무엇인가?」

이 질문에 대한 쿼리는 데이터 타입은 최적화했지만 정렬 키(ordering key)는 없는 이전의 `posts_v2` 테이블을 사용할 때 다음과 같습니다:

```sql
SELECT
    Id,
    Title,
    CommentCount
FROM posts_v2
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')
ORDER BY CommentCount DESC
LIMIT 3

┌───────Id─┬─Title─────────────────────────────────────────────────────────────┬─CommentCount─┐
│ 78203063 │ How to avoid default initialization of objects in std::vector?     │               74 │
│ 78183948 │ About memory barrier                                               │               52 │
│ 77900279 │ Speed Test for Buffer Alignment: IBM's PowerPC results vs. my CPU │        49 │
└──────────┴───────────────────────────────────────────────────────────────────┴──────────────

10 rows in set. Elapsed: 0.070 sec. Processed 59.82 million rows, 569.21 MB (852.55 million rows/s., 8.11 GB/s.)
Peak memory usage: 429.38 MiB.
```

> 여기에서의 쿼리는 6천만 행 전체를 선형 스캔했음에도 매우 빠릅니다 - ClickHouse는 그만큼 빠릅니다 :) TB 및 PB 규모에서는 정렬 키를 지정하는 것이 그만한 가치가 있다는 점을 신뢰해야 합니다!

정렬 키로 사용할 컬럼 `PostTypeId`와 `CreationDate`를 선택하겠습니다.

이 시나리오에서는 항상 `PostTypeId`로 필터링한다고 가정합니다. 이 컬럼의 카디널리티는 8이며 정렬 키의 첫 번째 항목으로 논리적인 선택입니다. 날짜 단위의 필터링으로도 충분하다고 판단되며(여전히 DateTime 필터에도 이점이 있습니다), 정렬 키의 두 번째 구성 요소로 `toDate(CreationDate)`를 사용합니다. 이렇게 하면 날짜를 16으로 표현할 수 있어 더 작은 인덱스가 생성되고, 필터링 속도가 빨라집니다. 최종 키 항목은 `CommentCount`로, 댓글이 가장 많은 게시물(최종 정렬 대상)을 찾는 데 도움이 됩니다.

```sql
CREATE TABLE posts_v3
(
        `Id` Int32,
        `PostTypeId` Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
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
        `ContentLicense` LowCardinality(String),
        `ParentId` String,
        `CommunityOwnedDate` DateTime,
        `ClosedDate` DateTime
)
ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
COMMENT 'Ordering Key'

--populate table from existing table

INSERT INTO posts_v3 SELECT * FROM posts_v2

0 rows in set. Elapsed: 158.074 sec. Processed 59.82 million rows, 76.21 GB (378.42 thousand rows/s., 482.14 MB/s.)
Peak memory usage: 6.41 GiB.

Our previous query improves the query response time by over 3x:

SELECT
    Id,
    Title,
    CommentCount
FROM posts_v3
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')
ORDER BY CommentCount DESC
LIMIT 3

10 rows in set. Elapsed: 0.020 sec. Processed 290.09 thousand rows, 21.03 MB (14.65 million rows/s., 1.06 GB/s.)
```

특정 타입과 적절한 정렬 키를 사용하여 압축 효율을 향상하는 방법에 대해서는 [Compression in ClickHouse](/data-compression/compression-in-clickhouse)를 참조하십시오. 압축을 더 향상해야 하는 경우 [Choosing the right column compression codec](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec) 섹션도 참고할 것을 권장합니다.


## Next: Data Modeling Techniques \{#next-data-modeling-techniques\}

지금까지는 단일 테이블만 마이그레이션했습니다. 이를 통해 핵심적인 ClickHouse 개념을 소개할 수 있었지만, 대부분의 스키마는 안타깝게도 이처럼 단순하지 않습니다.

아래에 나열된 다른 가이드들에서는 더 큰 스키마를 최적의 ClickHouse 쿼리를 위해 재구성하기 위한 여러 기법을 살펴봅니다. 이 과정 전반에서 `Posts`는 대부분의 분석용 쿼리가 수행되는 중심 테이블로 유지하는 것을 목표로 합니다. 다른 테이블도 독립적으로 쿼리할 수 있지만, 대부분의 분석은 `Posts`를 중심으로 수행된다고 가정합니다.

> 이 섹션 전반에서 다른 테이블의 최적화된 변형을 사용합니다. 이러한 테이블의 스키마는 제공하지만, 간결성을 위해 그 안에 담긴 설계 결정에 대한 설명은 생략합니다. 이 결정들은 앞에서 설명한 규칙에 기반하며, 그 결정 과정을 독자가 스스로 추론하도록 합니다.

다음 접근 방식들은 모두 JOIN 사용 필요성을 최소화하여 데이터 읽기와 쿼리 성능을 최적화하는 것을 목표로 합니다. ClickHouse는 조인을 완전히 지원하지만, 최적의 성능을 위해서는 조인을 최소한으로 사용하는 것(조인 쿼리에서 2~3개의 테이블은 무방함)을 권장합니다.

> ClickHouse에는 외래 키(foreign key) 개념이 없습니다. 이는 조인을 금지하는 것은 아니지만, 참조 무결성 관리가 데이터베이스가 아닌 애플리케이션 수준에서 사용자에게 맡겨진다는 의미입니다. ClickHouse와 같은 OLAP 시스템에서는 데이터 무결성을 데이터베이스에서 강제하여 큰 오버헤드를 발생시키기보다는, 애플리케이션 수준이나 데이터 수집 과정에서 관리하는 경우가 많습니다. 이러한 접근 방식은 더 높은 유연성과 더 빠른 데이터 삽입을 가능하게 합니다. 이는 매우 큰 데이터셋에서 읽기 및 삽입 쿼리의 속도와 확장성에 중점을 둔 ClickHouse의 철학과도 일치합니다.

쿼리 시점에서 조인 사용을 최소화하기 위해, 사용자는 여러 도구와 접근 방식을 활용할 수 있습니다:

- [**Denormalizing data**](/data-modeling/denormalization) - 테이블을 결합하고 1:1이 아닌 관계에 대해 복합 타입을 사용하여 데이터를 비정규화합니다. 이는 종종 조인을 쿼리 시점에서 삽입 시점으로 이동하는 것을 포함합니다.
- [**Dictionaries**](/dictionary) - 직접 조인과 키-값 조회를 처리하기 위한 ClickHouse 고유 기능입니다.
- [**Incremental Materialized Views**](/materialized-view/incremental-materialized-view) - 쿼리 시점의 연산 비용을 삽입 시점으로 이동시키는 ClickHouse 기능으로, 집계 값을 증분형으로 계산하는 기능을 포함합니다.
- [**Refreshable Materialized Views**](/materialized-view/refreshable-materialized-view) - 다른 데이터베이스 제품에서 사용하는 구체화된 뷰(Materialized View)와 유사하게, 쿼리 결과를 주기적으로 계산하고 그 결과를 캐시할 수 있게 해줍니다.

각 가이드에서 이러한 접근 방식들을 각각 살펴보며, 각 방법이 언제 적합한지, 그리고 Stack Overflow 데이터셋에 대한 질문을 해결하는 데 어떻게 적용할 수 있는지를 예제를 통해 설명합니다.