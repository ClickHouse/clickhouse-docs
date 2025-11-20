---
'slug': '/data-modeling/schema-design'
'title': '스키마 설계'
'description': '쿼리 성능을 위한 ClickHouse 스키마 최적화'
'keywords':
- 'schema'
- 'schema design'
- 'query optimization'
'doc_type': 'guide'
---

import stackOverflowSchema from '@site/static/images/data-modeling/stackoverflow-schema.png';
import schemaDesignIndices from '@site/static/images/data-modeling/schema-design-indices.png';
import Image from '@theme/IdealImage';

이해하기 쉬운 스키마 설계는 ClickHouse 성능 최적화의 핵심 요소이며, 이는 종종 상충하는 선택을 포함합니다. 최적의 접근 방식은 제공되는 쿼리와 데이터 업데이트 빈도, 지연 요구 사항, 데이터 양과 같은 요인에 따라 달라집니다. 이 가이드는 ClickHouse 성능 최적화를 위한 스키마 설계 모범 사례 및 데이터 모델링 기술에 대한 개요를 제공합니다.

## Stack Overflow 데이터셋 {#stack-overflow-dataset}

이 가이드의 예제에서는 Stack Overflow 데이터셋의 하위 집합을 사용합니다. 이는 2008년부터 2024년 4월까지 Stack Overflow에서 발생한 모든 게시물, 투표, 사용자, 댓글 및 배지를 포함합니다. 이 데이터는 아래의 스키마를 사용하여 Parquet 형식으로 `s3://datasets-documentation/stackoverflow/parquet/` S3 버킷에 있습니다:

> 표시된 기본 키 및 관계는 제약 조건을 통해 집행되지 않으며 (Parquet는 테이블이 아닌 파일 형식입니다), 순수하게 데이터 간의 관계 및 그것이 가진 유일한 키를 나타냅니다.

<Image img={stackOverflowSchema} size="lg" alt="Stack Overflow Schema"/>

<br />

Stack Overflow 데이터셋은 여러 개의 관련 테이블을 포함하고 있습니다. 데이터 모델링 작업에서 사용자는 먼저 기본 테이블을 로드하는 데 집중하는 것이 좋습니다. 이 테이블은 반드시 가장 큰 테이블일 필요는 없지만, 대부분의 분석 쿼리를 받을 것으로 예상되는 테이블이어야 합니다. 이렇게 하면 주된 ClickHouse 개념과 유형에 익숙해지는 데 도움이 되며, 주로 OLTP 배경에서 오는 경우 특히 중요합니다. 이 테이블은 ClickHouse 기능을 최대한 활용하고 최적 성능을 얻기 위해 추가 테이블이 추가됨에 따라 다시 모델링이 필요할 수 있습니다.

위 스키마는 이 가이드의 목적을 위해 의도적으로 최적화되지 않았습니다.

## 초기 스키마 설정 {#establish-initial-schema}

`posts` 테이블이 대부분의 분석 쿼리의 대상이 될 것이므로 이 테이블의 스키마 설정에 집중합니다. 이 데이터는 연도별로 파일 하나씩 있는 공개 S3 버킷 `s3://datasets-documentation/stackoverflow/parquet/posts/*.parquet`에서 사용 가능합니다.

> Parquet 형식의 S3에서 데이터 로드는 ClickHouse에 데이터를 로드하는 가장 일반적이고 선호되는 방법입니다. ClickHouse는 Parquet 처리를 최적화하였으며, S3에서 초당 수천만 행을 읽고 삽입할 수 있습니다.

ClickHouse는 데이터셋의 유형을 자동으로 식별할 수 있는 스키마 추론 기능을 제공합니다. 이는 Parquet을 포함한 모든 데이터 형식에 대해 지원됩니다. 우리는 s3 테이블 함수 및 [`DESCRIBE`](/sql-reference/statements/describe-table) 명령을 통해 데이터에 대한 ClickHouse 유형을 식별하기 위해 이 기능을 활용할 수 있습니다. 아래에서는 glob 패턴 `*.parquet`를 사용하여 `stackoverflow/parquet/posts` 폴더의 모든 파일을 읽습니다.

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

> [s3 테이블 함수](/sql-reference/table-functions/s3)는 ClickHouse에서 S3의 데이터를 직접 쿼리할 수 있도록 합니다. 이 기능은 ClickHouse가 지원하는 모든 파일 형식과 호환됩니다.

이로 인해 초기 비최적화된 스키마가 생성됩니다. 기본적으로 ClickHouse는 이러한 타입을 해당하는 Nullable 타입으로 매핑합니다. 우리는 이 타입들을 사용하여 간단한 `CREATE EMPTY AS SELECT` 명령으로 ClickHouse 테이블을 만들 수 있습니다.

```sql
CREATE TABLE posts
ENGINE = MergeTree
ORDER BY () EMPTY AS
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')
```

몇 가지 중요한 점:

- 이 명령을 실행한 후 우리의 posts 테이블은 비어 있습니다. 데이터가 로드되지 않았습니다.
- 우리는 MergeTree를 우리의 테이블 엔진으로 지정했습니다. MergeTree는 대부분 사용자가 사용할 가장 일반적인 ClickHouse 테이블 엔진입니다. 이것은 PB 규모의 데이터를 처리할 수 있는 ClickHouse의 멀티 툴이며, 대부분의 분석 사용 사례에 적합합니다. 효율적인 업데이트를 지원해야 하는 CDC와 같은 다른 테이블 엔진도 존재합니다.

`ORDER BY ()` 절은 우리가 인덱스가 없으며, 더 구체적으로 데이터에 순서가 없음을 의미합니다. 이는 나중에 더 자세히 설명합니다. 현재는 모든 쿼리가 선형 스캔을 요구할 것임을 아는 것으로 충분합니다.

테이블이 생성되었음을 확인하려면:

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

초기 스키마가 정의되었으므로, s3 테이블 함수를 사용하여 데이터를 읽고 `INSERT INTO SELECT`를 사용하여 데이터를 채울 수 있습니다. 다음 코드는 8코어 ClickHouse Cloud 인스턴스에서 약 2분 만에 `posts` 데이터를 로드합니다.

```sql
INSERT INTO posts SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 148.140 sec. Processed 59.82 million rows, 38.07 GB (403.80 thousand rows/s., 257.00 MB/s.)
```

> 위 쿼리는 60m 행을 로드합니다. ClickHouse에서는 작지만, 느린 인터넷 연결을 가진 사용자들은 로드할 데이터의 하위 집합을 로드하고 싶을 것입니다. 이는 glob 패턴을 통해 연도별로 로드할 항목을 지정함으로써 쉽게 할 수 있습니다. 예를 들어, `https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2008.parquet` 또는 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/{2008, 2009}.parquet`와 같은 방법입니다. glob 패턴을 사용하여 파일의 하위 집합을 대상으로 하는 방법은 [여기](/sql-reference/table-functions/file#globs-in-path)에서 확인하세요.

## 최적화된 타입 {#optimizing-types}

ClickHouse 쿼리 성능의 비밀 중 하나는 압축입니다.

디스크에서 데이터의 양이 적으면 적은 I/O로 인해 쿼리와 삽입이 더 빨라집니다. 어떤 압축 알고리즘의 CPU에 대한 오버헤드는 대개 IO 감소에 의해 상쇄됩니다. 따라서 ClickHouse 쿼리가 빠르게 실행되도록 보장하는 데 있어서 데이터의 압축을 개선하는 것이 가장 먼저 집중해야 할 사항입니다.

> ClickHouse가 데이터를 이렇게 잘 압축하는 이유에 대한 자세한 설명은 [이 기사](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)를 추천합니다. 요약하자면, 열 지향 데이터베이스로서 값이 열 순서로 기록됩니다. 이러한 값이 정렬되면 동일한 값이 서로 인접하게 됩니다. 압축 알고리즘은 데이터의 연속 패턴을 활용합니다. 이 외에도 ClickHouse는 사용자가 압축 기술을 추가로 조정할 수 있도록 하는 코덱 및 세분화된 데이터 유형을 제공합니다.

ClickHouse의 압축은 세 가지 주요 요인의 영향을 받습니다: 정렬 키, 데이터 유형 및 사용되는 코덱. 이러한 모든 항목은 스키마를 통해 구성됩니다.

압축 및 쿼리 성능을 초기 상태에서 가장 많이 개선할 수 있는 방법은 타입 최적화의 간단한 프로세스로 얻을 수 있습니다. 스키마를 최적화하기 위해 적용할 수 있는 몇 가지 간단한 규칙은 다음과 같습니다:

- **엄격한 유형 사용** - 우리의 초기 스키마는 Clearly numeric인 많은 컬럼에 Strings를 사용했습니다. 올바른 유형 사용은 필터링 및 집계 시 예상하는 의미론을 보장합니다. 날짜 유형도 포함되어 있으며, Parquet 파일에서 올바르게 제공되고 있습니다.
- **Nullable 컬럼 피하기** - 기본적으로 위 컬럼은 Null로 가정되고 있습니다. Nullable 타입을 사용하면 쿼리가 빈 값과 Null 값의 차이를 구분할 수 있도록 합니다. 이는 UInt8 타입의 별도 컬럼을 생성합니다. 이 추가 컬럼은 사용자가 nullable 컬럼으로 작업할 때마다 처리해야 하며, 이는 추가 저장 공간 사용을 초래하고 거의 항상 쿼리 성능에 부정적인 영향을 미칩니다. 기본형의 빈 값과 Null 사이에 차이가 있는 경우에만 Nullable을 사용하세요. 예를 들어, `ViewCount` 컬럼에서 빈 값에 대해 0이라는 값이 대부분의 쿼리에서 충분하며 결과에 영향을 미치지 않습니다. 빈 값이 다르게 처리되어야 한다면 필터로도 종종 쿼리에서 제외할 수 있습니다.
- **숫자 타입 최소 정밀도 사용하기** - ClickHouse는 다양한 숫자 범위 및 정확도를 위해 설계된 여러 숫자 유형이 있습니다. 컬럼을 나타내는 데 필요한 비트 수를 최소화하는 것을 목표로 하세요. Int16과 같은 다양한 크기의 정수 외에도 ClickHouse는 최소 값이 0인 부호 없는 변수를 제공합니다. 이 변수는 컬럼에 대해 적은 비트를 사용할 수 있게 하며, 예를 들어 UInt16의 최대 값은 65535로, Int16의 두 배입니다. 가능한 한 이러한 유형을 선호하세요.
- **날짜 유형에 대한 최소 정밀도 사용하기** - ClickHouse는 여러 날짜 및 날짜 시간 유형을 지원합니다. Date 및 Date32는 순수 날짜를 저장하는 데 사용할 수 있으며, 후자는 더 많은 비트의 대가로 더 넓은 날짜 범위를 지원합니다. DateTime 및 DateTime64는 날짜 시간에 대한 지원을 제공합니다. DateTime은 초 단위로 제한되어 있으며 32비트를 사용합니다. DateTime64는 이름이 암시하는 바와 같이 64비트를 사용하지만 나노초 단위의 지원을 제공합니다. 항상 쿼리에 대해 수용 가능한 더 거친 버전을 선택하고 필요한 비트 수를 최소화하세요.
- **LowCardinality 사용하기** - 고유 값의 수가 적은 정수, 문자열, Date 또는 DateTime 컬럼은 LowCardinality 타입을 사용하여 인코딩할 수 있습니다. 이 딕셔너리는 값을 인코딩하여 디스크 크기를 줄입니다. 고유 값이 1만 개 이하인 컬럼에 대해 고려하세요.
- **특수 경우에 FixedString 사용하기** - 고정 길이를 가진 문자열은 FixedString 타입으로 인코딩할 수 있습니다. 예를 들어, 언어 및 통화 코드가 해당됩니다. 데이터가 정확히 N 바이트의 길이를 가질 때 효율적입니다. 다른 경우에는 효율성을 줄일 수 있으며 LowCardinality를 선호하는 것이 좋습니다.
- **데이터 유효성을 위한 Enum 사용하기** - Enum 타입은 열거형 타입을 효율적으로 인코딩하는 데 사용할 수 있습니다. Enum은 저장해야 하는 고유 값의 수에 따라 8 또는 16비트일 수 있습니다. 삽입 시 연관된 유효성을 필요로 하거나 Enum 값에서 자연스러운 순서를 활용하는 쿼리를 수행하고 싶다면 이를 사용하는 것을 고려하세요. 예를 들어, 사용자 응답이 포함된 피드백 컬럼을 `Enum(':(' = 1, ':|' = 2, ':)' = 3)`으로 사용할 수 있습니다.

> 팁: 모든 컬럼의 범위와 고유 값 수를 찾으려면 사용자는 간단한 쿼리 `SELECT * APPLY min, * APPLY max, * APPLY uniq FROM table FORMAT Vertical`을 사용할 수 있습니다. 이 쿼리는 비용이 높을 수 있으므로 작은 데이터의 하위 집합에서 수행하는 것이 좋습니다. 이 쿼리는 정밀한 결과를 얻기 위해 숫자가 최소한 정의되어 있어야 합니다. 즉, 문자열이 아니어야 합니다.

위의 간단한 규칙을 posts 테이블에 적용하여 각 컬럼의 최적 유형을 식별할 수 있습니다:

| Column                  | Is Numeric | Min, Max                                                              | Unique Values | Nulls | Comment                                                                                      | Optimized Type                           |
|------------------------|------------|------------------------------------------------------------------------|----------------|--------|----------------------------------------------------------------------------------------------|------------------------------------------|
| `PostTypeId`             | Yes        | 1, 8                                                                   | 8              | No     |                                                                                              | `Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8)` |
| `AcceptedAnswerId`      | Yes        | 0, 78285170                                                            | 12282094       | Yes    | Null과 0 값을 구별                                                                         | UInt32                                   |
| `CreationDate`           | No         | 2008-07-31 21:42:52.667000000, 2024-03-31 23:59:17.697000000           | -              | No     | 밀리초 정밀도가 필요 없으므로 DateTime 사용                                                | DateTime                                 |
| `Score`                  | Yes        | -217, 34970                                                            | 3236           | No     |                                                                                              | Int32                                    |
| `ViewCount`              | Yes        | 2, 13962748                                                            | 170867         | No     |                                                                                              | UInt32                                   |
| `Body`                   | No         | -                                                                      | -              | No     |                                                                                              | String                                   |
| `OwnerUserId`            | Yes        | -1, 4056915                                                            | 6256237        | Yes    |                                                                                              | Int32                                    |
| `OwnerDisplayName`       | No         | -                                                                      | 181251         | Yes    | Null을 빈 문자열로 간주                                                                      | String                                   |
| `LastEditorUserId`       | Yes        | -1, 9999993                                                            | 1104694        | Yes    | 0은 Null에 사용될 수 있는 미사용 값                                                          | Int32                                    |
| `LastEditorDisplayName`  | No         | -                                                                      | 70952          | Yes    | Null을 빈 문자열로 간주하며 LowCardinality 테스트에서 이점을 보지 못했습니다                     | String                                   |
| `LastEditDate`           | No         | 2008-08-01 13:24:35.051000000, 2024-04-06 21:01:22.697000000           | -              | No     | 밀리초 정밀도가 필요 없으므로 DateTime 사용                                                | DateTime                                 |
| `LastActivityDate`       | No         | 2008-08-01 12:19:17.417000000, 2024-04-06 21:01:22.697000000           | -              | No     | 밀리초 정밀도가 필요 없으므로 DateTime 사용                                                | DateTime                                 |
| `Title`                  | No         | -                                                                      | -              | No     | Null을 빈 문자열로 간주                                                                      | String                                   |
| `Tags`                   | No         | -                                                                      | -              | No     | Null을 빈 문자열로 간주                                                                      | String                                   |
| `AnswerCount`            | Yes        | 0, 518                                                                 | 216            | No     | Null과 0을 동일하게 간주                                                                      | UInt16                                   |
| `CommentCount`           | Yes        | 0, 135                                                                 | 100            | No     | Null과 0을 동일하게 간주                                                                      | UInt8                                    |
| `FavoriteCount`          | Yes        | 0, 225                                                                 | 6              | Yes    | Null과 0을 동일하게 간주                                                                      | UInt8                                    |
| `ContentLicense`         | No         | -                                                                      | 3              | No     | LowCardinality가 FixedString보다 우수합니다                                                 | LowCardinality(String)                   |
| `ParentId`               | No         | -                                                                      | 20696028       | Yes    | Null을 빈 문자열로 간주                                                                      | String                                   |
| `CommunityOwnedDate`     | No         | 2008-08-12 04:59:35.017000000, 2024-04-01 05:36:41.380000000           | -              | Yes    | Null에 대한 기본값 1970-01-01을 고려합니다. 밀리초 정밀도는 필요 없으며 DateTime 사용합니다          | DateTime                                 |
| `ClosedDate`             | No         | 2008-09-04 20:56:44, 2024-04-06 18:49:25.393000000                     | -              | Yes    | Null에 대한 기본값 1970-01-01을 고려합니다. 밀리초 정밀도는 필요 없으며 DateTime 사용합니다          | DateTime                                 |

<br />

위의 내용은 다음과 같은 스키마를 제공합니다:

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

이 스키마에 대해 이전 테이블에서 데이터를 읽고 이를 삽입하여 간단한 `INSERT INTO SELECT`로 채울 수 있습니다:

```sql
INSERT INTO posts_v2 SELECT * FROM posts

0 rows in set. Elapsed: 146.471 sec. Processed 59.82 million rows, 83.82 GB (408.40 thousand rows/s., 572.25 MB/s.)
```

우리의 새로운 스키마에서는 Null을 유지하지 않습니다. 위의 삽입은 이들을 해당 유형의 기본값으로 암시적으로 변환합니다 - 정수의 경우 0, 문자열의 경우 빈 값입니다. ClickHouse는 또한 자동으로 모든 숫자를 목표 정밀도로 변환합니다.
ClickHouse에서의 기본 키(정렬 키)
OLTP 데이터베이스에서 오는 사용자는 ClickHouse에서 동등한 개념을 찾고자 합니다.

## 정렬 키 선택하기 {#choosing-an-ordering-key}

ClickHouse가 자주 사용되는 규모에서는 메모리 및 디스크 효율성이 매우 중요합니다. 데이터는 파트라는 청크로 ClickHouse 테이블에 기록되며, 백그라운드에서 파트를 병합하는 규칙이 적용됩니다. ClickHouse에서 각 파트는 고유한 기본 인덱스를 가지고 있습니다. 파트가 병합될 때 병합된 파트의 기본 인덱스도 병합됩니다. 파트의 기본 인덱스는 행 그룹당 하나의 인덱스 항목을 가지고 있으며, 이 기술을 스파스 인덱싱이라고 합니다.

<Image img={schemaDesignIndices} size="md" alt="Sparse Indexing in ClickHouse"/>

ClickHouse에서 선택한 키는 인덱스뿐 아니라 디스크에 데이터가 기록되는 순서를 결정합니다. 그로 인해 압축 수준에 크게 영향을 줄 수 있으며, 이는 쿼리 성능에 영향을 미칠 수 있습니다. 대다수 컬럼의 값이 인접한 순서로 기록되는 정렬 키는 선택된 압축 알고리즘(및 코덱)이 데이터를 더 효과적으로 압축할 수 있게 해줍니다.

> 테이블의 모든 컬럼은 지정된 정렬 키의 값에 따라 정렬됩니다. 이들 컬럼이 정렬 키에 포함되어 있는지 여부와는 상관 없습니다. 예를 들어, `CreationDate`가 키로 사용된다면 다른 모든 컬럼의 값 순서는 `CreationDate` 컬럼의 값 순서를 나타냅니다. 여러 개의 정렬 키를 지정할 수 있으며 - 이는 `SELECT` 쿼리의 `ORDER BY` 절과 같은 의미로 정렬됩니다.

정렬 키를 선택하는 데 도움이 되는 몇 가지 간단한 규칙을 적용할 수 있습니다. 다음 규칙들은 때때로 상충할 수 있으므로 순서대로 고려하시기 바랍니다. 사용자는 이 과정을 통해 여러 키를 식별할 수 있으며, 일반적으로 4-5개가 충분합니다:

- 일반 필터와 일치하는 컬럼 선택하기. 컬럼이 `WHERE` 절에서 자주 사용된다면, 이들을 정렬 키에 포함하는 것이 덜 자주 사용되는 컬럼보다 우선시해야 합니다.
- 필터링할 때 전체 행의 큰 비율을 제외하는 데 도움이 되는 컬럼을 선호하세요. 이렇게 하면 읽어야 할 데이터 양이 줄어듭니다.
- 테이블 내의 다른 컬럼과 높은 상관 관계가 있을 가능성이 있는 컬럼을 선호합니다. 이는 이러한 값들이 연속적으로 저장되게 하여 압축을 개선하는 데 도움이 됩니다.
- 정렬 키에 있는 컬럼에 대한 `GROUP BY` 및 `ORDER BY` 작업은 메모리 효율을 높일 수 있습니다.

정렬 키에 대한 컬럼의 하위 집합을 식별할 때는 컬럼을 특정 순서로 선언하세요. 이 순서는 쿼리에서 보조 키 컬럼의 필터링 효율성과 테이블 데이터 파일의 압축 비율 모두에 상당한 영향을 미칠 수 있습니다. 일반적으로, 카디널리티의 오름차순으로 키를 정렬하는 것이 가장 좋습니다. 이는 정렬 키에 나중에 나타나는 컬럼의 필터링이 더 이와 반대인 경우보다 효율적이지 않게 된다는 사실과 균형을 이루어야 합니다. 이러한 동작을 균형 있게 조율하고 액세스 패턴을 고려하세요 (가장 중요한 것은 변형을 테스트하는 것입니다).

### 예제 {#example}

위의 가이드라인을 posts 테이블에 적용한다고 가정해 봅시다. 사용자가 날짜 및 게시물 유형별로 필터링하는 분석을 수행하려고 합니다. 예를 들어, "지난 3개월 동안 가장 댓글이 많은 질문은 무엇인가요?"라는 것입니다.

이 질문에 대한 쿼리는 최적화된 타입이지만 정렬 키가 없는 이전 `posts_v2` 테이블을 사용하는 것입니다:

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

> 이 쿼리는 모든 60m 행이 선형 스캔되었음에도 불구하고 매우 빠릅니다 - ClickHouse는 그저 빠릅니다 :) TB 및 PB 규모에서는 정렬 키가 정말 중요하다는 것을 아셔야 합니다!

`PostTypeId` 및 `CreationDate`를 우리의 정렬 키로 선택합시다.

그런데, 사용자들이 항상 `PostTypeId`로 필터링할 것으로 예상되므로, 이는 8의 카디널리티를 갖고 있으며 정렬 키의 첫 번째 항목으로 논리적인 선택이 됩니다. 날짜 정밀도 필터링이 충분할 가능성을 인식하며 (날짜 시간 필터에도 여전히 이점을 줄 것입니다) `toDate(CreationDate)`를 우리의 키의 두 번째 구성으로 사용합니다. 그렇게 하면 날짜가 16로 표현될 수 있으며, 필터링 속도를 높입니다. 최종 키 항목은 가장 댓글이 많은 게시물을 찾는 데 도움이 되는 `CommentCount`입니다 (최종 정렬을 위하여).

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

특정 타입 사용 및 적절한 정렬 키 사용으로 얻은 압축 개선에 관심이 있는 사용자들은 [ClickHouse에서의 압축](/data-compression/compression-in-clickhouse)을 확인하세요. 압축을 더 향상시키고 싶은 사용자는 [적절한 열 압축 코덱 선택하기](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec) 섹션도 추천합니다.

## 다음: 데이터 모델링 기술 {#next-data-modeling-techniques}

지금까지 우리는 단일 테이블만 마이그레이션했습니다. 이것은 일부 핵심 ClickHouse 개념을 소개하는 데 도움이 되었지만, 대부분의 스키마는 불행히도 그렇게 간단하지 않습니다.

아래 나열된 다른 가이드에서는 ClickHouse 쿼리를 최적화하기 위해 더 넓은 스키마를 재구성하는 여러 가지 기술을 살펴보겠습니다. 이 과정에서 우리는 `Posts` 테이블이 대부분의 분석 쿼리에서 중심 테이블로 남아 있도록 목표로 합니다. 다른 테이블도 독립적으로 쿼리할 수 있지만, 대부분의 분석이 `posts` 맥락에서 수행되기를 원합니다.

> 이 섹션에서는 다른 테이블의 최적화된 변형을 사용합니다. 이러한 스키마를 제공하지만, 간결함을 위해 내린 결정은 생략합니다. 이러한 결정은 이전에 설명된 규칙을 바탕으로 하며, 독자가 이를 추론하도록 남깁니다.

다음 접근 방식은 모두 읽기를 최적화하고 쿼리 성능을 향상시키기 위해 JOIN의 필요성을 최소화하는 데 목적을 둡니다. JOIN이 ClickHouse에서 완전히 지원되지만, 우리는 최적 성능을 위해 드물게 사용될 것을 권장합니다 (JOIN 쿼리에서 2~3개의 테이블은 괜찮습니다).

> ClickHouse는 외래 키라는 개념이 없습니다. 이는 조인을 금지하지 않지만, 참조 무결성은 사용자가 애플리케이션 수준에서 관리해야 함을 의미합니다. ClickHouse와 같은 OLAP 시스템에서는 데이터 무결성이 일반적으로 애플리케이션 수준에서 관리되거나 데이터 수집 프로세스 중에 처리되며, 데이터베이스에 의해 집행되며 이는 상당한 오버헤드를 발생시킵니다. 이러한 접근 방식은 더 많은 유연성 및 빠른 데이터 삽입을 가능하게 합니다. 이는 ClickHouse의 매우 큰 데이터 세트에서 읽기 및 삽입 쿼리 속도 및 확장성에 중점을 둡니다.

쿼리 시간에 Joins의 사용을 최소화하기 위해 사용자는 여러 도구/접근 방식을 사용할 수 있습니다:

- [**비정규화 데이터**](/data-modeling/denormalization) - 테이블을 결합하고 1:1 관계가 아닌 복잡한 타입을 사용하여 데이터를 비정규화합니다. 이는 종종 쿼리 시간의 조인을 삽입 시간으로 이동하는 것입니다.
- [**딕셔너리**](/dictionary) - 직접 조인 및 키 값 조회를 처리하기 위해 ClickHouse에서 제공하는 특정 기능입니다.
- [**증분 물리화된 뷰**](/materialized-view/incremental-materialized-view) - 쿼리 시간의 계산 비용을 삽입 시간으로 전환하고 증분 집계 값을 계산할 수 있는 ClickHouse 기능입니다.
- [**갱신 가능한 물리화된 뷰**](/materialized-view/refreshable-materialized-view) - 다른 데이터베이스 제품에서 사용되는 물리화된 뷰와 유사하게, 쿼리 결과를 주기적으로 계산하고 결과를 캐시할 수 있게 합니다.

각 가이드에서 각 접근 방식을 설명하고, 각 접근 방식이 언제 적절한지에 대한 예제를 통해 Stack Overflow 데이터셋 문제 해결에 적용하는 방법을 강조합니다.
