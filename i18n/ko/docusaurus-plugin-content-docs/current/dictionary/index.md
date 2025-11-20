---
'slug': '/dictionary'
'title': '딕셔너리'
'keywords':
- 'dictionary'
- 'dictionaries'
'description': '딕셔너리는 빠른 조회를 위한 데이터의 키-값 표현을 제공합니다.'
'doc_type': 'reference'
---

import dictionaryUseCases from '@site/static/images/dictionary/dictionary-use-cases.png';
import dictionaryLeftAnyJoin from '@site/static/images/dictionary/dictionary-left-any-join.png';
import Image from '@theme/IdealImage';



# 딕셔너리

ClickHouse의 딕셔너리는 다양한 [내부 및 외부 소스](/sql-reference/dictionaries#dictionary-sources)로부터 데이터를 메모리에 [키-값](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) 형태로 제공하여, 초저지연 조회 쿼리를 최적화합니다.

딕셔너리는 다음과 같은 데 유용합니다:
- 쿼리 성능 향상, 특히 `JOIN`과 함께 사용할 때
- 데이터 수집 프로세스를 느리게 하지 않고 즉석에서 수집된 데이터를 풍부하게 함

<Image img={dictionaryUseCases} size="lg" alt="ClickHouse의 딕셔너리 사용 사례"/>

## 딕셔너리를 사용한 조인 속도 향상 {#speeding-up-joins-using-a-dictionary}

딕셔너리는 특정 유형의 `JOIN`, 즉 조인 키가 기본 키-값 저장소의 키 속성과 일치해야 하는 [`LEFT ANY` 유형](/sql-reference/statements/select/join#supported-types-of-join)을 가속화하는 데 사용할 수 있습니다.

<Image img={dictionaryLeftAnyJoin} size="sm" alt="LEFT ANY JOIN과 함께 딕셔너리 사용"/>

이 경우 ClickHouse는 딕셔너리를 활용하여 [Direct Join](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4#direct-join)을 수행할 수 있습니다. 이는 ClickHouse의 가장 빠른 조인 알고리즘으로, 오른쪽 테이블이 저지연 키-값 요청을 지원하는 경우 적용됩니다. ClickHouse는 이 기능을 제공하는 세 가지 테이블 엔진이 있습니다: [Join](/engines/table-engines/special/join) (기본적으로 미리 계산된 해시 테이블임), [EmbeddedRocksDB](/engines/table-engines/integrations/embedded-rocksdb) 및 [Dictionary](/engines/table-engines/special/dictionary). 우리는 딕셔너리 기반 접근법을 설명하겠지만, 메커니즘은 세 가지 엔진 모두에서 동일합니다.

직접 조인 알고리즘은 오른쪽 테이블이 딕셔너리로 지원되어야 하며, 그 테이블에서 조인할 데이터가 메모리에 저지연 키-값 데이터 구조로 이미 존재해야 합니다.

### 예제 {#example}

Stack Overflow 데이터세트를 사용하여 질문에 답해보겠습니다:
*Hacker News에서 SQL과 관련된 가장 논란이 많은 게시물은 무엇입니까?*

우리는 게시물이 비슷한 수의 좋아요 및 싫어요 투표를 받을 때 논란이 많다고 정의하겠습니다. 우리는 이 절댓값 차이를 계산하며, 값이 0에 가까울수록 더 많은 논란이 발생한 것으로 간주합니다. 우리는 게시물이 최소 10개의 좋아요 및 싫어요 투표를 받았다고 가정할 것입니다. 투표가 없는 게시물은 논란이 많지 않을 것입니다.

데이터를 정규화한 후, 이 쿼리는 현재 `posts` 및 `votes` 테이블을 사용하는 `JOIN`을 필요로 합니다:

```sql
WITH PostIds AS
(
         SELECT Id
         FROM posts
         WHERE Title ILIKE '%SQL%'
)
SELECT
    Id,
    Title,
    UpVotes,
    DownVotes,
    abs(UpVotes - DownVotes) AS Controversial_ratio
FROM posts
INNER JOIN
(
    SELECT
         PostId,
         countIf(VoteTypeId = 2) AS UpVotes,
         countIf(VoteTypeId = 3) AS DownVotes
    FROM votes
    WHERE PostId IN (PostIds)
    GROUP BY PostId
    HAVING (UpVotes > 10) AND (DownVotes > 10)
) AS votes ON posts.Id = votes.PostId
WHERE Id IN (PostIds)
ORDER BY Controversial_ratio ASC
LIMIT 1

Row 1:
──────
Id:                     25372161
Title:                  How to add exception handling to SqlDataSource.UpdateCommand
UpVotes:                13
DownVotes:              13
Controversial_ratio: 0

1 rows in set. Elapsed: 1.283 sec. Processed 418.44 million rows, 7.23 GB (326.07 million rows/s., 5.63 GB/s.)
Peak memory usage: 3.18 GiB.
```

>**`JOIN`의 오른쪽에 작은 데이터세트를 사용하세요**: 이 쿼리는 `PostId`에서 필터링이 외부 쿼리와 내부 쿼리 모두에서 발생하기 때문에 필요 이상으로 장황해 보일 수 있습니다. 이는 쿼리 응답 시간을 빠르게 보장하기 위한 성능 최적화입니다. 최적의 성능을 위해 항상 `JOIN`의 오른쪽은 작은 집합이어야 하며, 가능한 한 작게 만들어야 합니다.  `JOIN` 성능을 최적화하고 사용 가능한 알고리즘을 이해하기 위한 팁은 [이 블로그 시리즈](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)를 추천합니다.

이 쿼리는 빠르지만, 좋은 성능을 달성하기 위해 `JOIN`을 신중하게 작성해야 합니다. 이상적으로는 "SQL"이 포함된 게시물만 필터링한 후, 해당 블로그의 `UpVote` 및 `DownVote` 수를 확인하여 메트릭을 계산하고자 합니다.

#### 딕셔너리 적용하기 {#applying-a-dictionary}

이 개념을 시연하기 위해 наши 합산 데이터를 위해 딕셔너리를 사용합니다. 딕셔너리는 일반적으로 메모리에 유지되므로 ([ssd_cache](/sql-reference/dictionaries#ssd_cache) 이 예외입니다) 사용자는 데이터 크기에 유의해야 합니다. 우리의 `votes` 테이블 크기를 확인합니다:

```sql
SELECT table,
        formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
        formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
        round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table IN ('votes')
GROUP BY table

┌─table───────────┬─compressed_size─┬─uncompressed_size─┬─ratio─┐
│ votes           │ 1.25 GiB        │ 3.79 GiB          │  3.04 │
└─────────────────┴─────────────────┴───────────────────┴───────┘
```

데이터는 딕셔너리에 압축되지 않은 형식으로 저장될 것이므로, 모든 컬럼을 딕셔너리에 저장하기 위해서는 최소 4GB의 메모리가 필요합니다(우리는 그렇지 않을 것입니다). 딕셔너리는 클러스터 전역에 복제되므로, 이 메모리 양은 *노드당* 확보되어야 합니다.

> 아래 예제에서는 우리의 딕셔너리 데이터가 ClickHouse 테이블에서 비롯됩니다. 이는 딕셔너리의 가장 일반적인 소스를 나타내지만, [여러 소스](/sql-reference/dictionaries#dictionary-sources)가 지원되며, 여기에는 파일, http 및 [Postgres](/sql-reference/dictionaries#postgresql) 데이터베이스가 포함됩니다. 우리가 보여드릴 것처럼, 딕셔너리는 자동으로 새로 고쳐져 자주 변경되는 작은 데이터세트를 직접 조인에 사용할 수 있는 이상적인 방법을 제공합니다.

우리의 딕셔너리는 조회가 수행될 기본 키가 필요합니다. 이는 개념적으로 트랜잭션 데이터베이스의 기본 키와 동일하며 고유해야 합니다. 우리의 쿼리는 `PostId`라는 조인 키에 대한 조회를 요구합니다. 딕셔너리는 우리의 `votes` 테이블에서 `PostId`당 총 좋아요 및 싫어요 투표수를 사용하여 채워져야 합니다. 다음은 이 딕셔너리 데이터를 얻기 위한 쿼리입니다:

```sql
SELECT PostId,
   countIf(VoteTypeId = 2) AS UpVotes,
   countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY PostId
```

딕셔너리를 생성하기 위해서는 다음 DDL이 필요합니다 - 위의 쿼리를 사용하는 것을 주목하세요:

```sql
CREATE DICTIONARY votes_dict
(
  `PostId` UInt64,
  `UpVotes` UInt32,
  `DownVotes` UInt32
)
PRIMARY KEY PostId
SOURCE(CLICKHOUSE(QUERY 'SELECT PostId, countIf(VoteTypeId = 2) AS UpVotes, countIf(VoteTypeId = 3) AS DownVotes FROM votes GROUP BY PostId'))
LIFETIME(MIN 600 MAX 900)
LAYOUT(HASHED())

0 rows in set. Elapsed: 36.063 sec.
```

> 자체 관리 OSS에서는 위 명령이 모든 노드에서 실행되어야 합니다. ClickHouse Cloud에서는 딕셔너리가 자동으로 모든 노드에 복제됩니다. 위 명령은 64GB RAM을 가진 ClickHouse Cloud 노드에서 실행되었으며, 로드하는 데 36초가 소요되었습니다.

딕셔너리에 의해 소비되는 메모리를 확인합니다:

```sql
SELECT formatReadableSize(bytes_allocated) AS size
FROM system.dictionaries
WHERE name = 'votes_dict'

┌─size─────┐
│ 4.00 GiB │
└──────────┘
```

특정 `PostId`에 대한 좋아요 및 싫어요 투표를 이제 간단한 `dictGet` 함수를 사용하여 가져올 수 있습니다. 아래는 게시물 `11227902`에 대한 값을 얻는 방법입니다:

```sql
SELECT dictGet('votes_dict', ('UpVotes', 'DownVotes'), '11227902') AS votes

┌─votes──────┐
│ (34999,32) │
└────────────┘

Exploiting this in our earlier query, we can remove the JOIN:

WITH PostIds AS
(
        SELECT Id
        FROM posts
        WHERE Title ILIKE '%SQL%'
)
SELECT Id, Title,
        dictGet('votes_dict', 'UpVotes', Id) AS UpVotes,
        dictGet('votes_dict', 'DownVotes', Id) AS DownVotes,
        abs(UpVotes - DownVotes) AS Controversial_ratio
FROM posts
WHERE (Id IN (PostIds)) AND (UpVotes > 10) AND (DownVotes > 10)
ORDER BY Controversial_ratio ASC
LIMIT 3

3 rows in set. Elapsed: 0.551 sec. Processed 119.64 million rows, 3.29 GB (216.96 million rows/s., 5.97 GB/s.)
Peak memory usage: 552.26 MiB.
```

이 쿼리는 훨씬 단순할 뿐만 아니라, 속도도 두 배 이상 빠릅니다! 이는 10개의 이상 좋아요 및 싫어요 투표가 있는 게시물만 딕셔너리에 로드하고, 사전 계산된 논란 값을 저장함으로써 더 최적화될 수 있습니다.

## 쿼리 시간 데이터 풍부화 {#query-time-enrichment}

딕셔너리는 쿼리 시간에 값을 조회하는 데 사용할 수 있습니다. 이러한 값은 결과로 반환하거나 집계에 사용할 수 있습니다. 사용자 ID를 위치에 매핑하는 딕셔너리를 생성한다고 가정해 보겠습니다:

```sql
CREATE DICTIONARY users_dict
(
  `Id` Int32,
  `Location` String
)
PRIMARY KEY Id
SOURCE(CLICKHOUSE(QUERY 'SELECT Id, Location FROM stackoverflow.users'))
LIFETIME(MIN 600 MAX 900)
LAYOUT(HASHED())
```

우리는 이 딕셔너리를 사용하여 게시물 결과를 풍부하게 만들 수 있습니다:

```sql
SELECT
        Id,
        Title,
        dictGet('users_dict', 'Location', CAST(OwnerUserId, 'UInt64')) AS location
FROM posts
WHERE Title ILIKE '%clickhouse%'
LIMIT 5
FORMAT PrettyCompactMonoBlock

┌───────Id─┬─Title─────────────────────────────────────────────────────────┬─Location──────────────┐
│ 52296928 │ Comparison between two Strings in ClickHouse                  │ Spain                 │
│ 52345137 │ How to use a file to migrate data from mysql to a clickhouse? │ 中国江苏省Nanjing Shi   │
│ 61452077 │ How to change PARTITION in clickhouse                         │ Guangzhou, 广东省中国   │
│ 55608325 │ Clickhouse select last record without max() on all table      │ Moscow, Russia        │
│ 55758594 │ ClickHouse create temporary table                             │ Perm', Russia         │
└──────────┴───────────────────────────────────────────────────────────────┴───────────────────────┘

5 rows in set. Elapsed: 0.033 sec. Processed 4.25 million rows, 82.84 MB (130.62 million rows/s., 2.55 GB/s.)
Peak memory usage: 249.32 MiB.
```

위의 조인 예제와 유사하게, 우리는 대부분의 게시물이 어디에서 유래하는지를 효율적으로 결정하기 위해 같은 딕셔너리를 사용할 수 있습니다:

```sql
SELECT
        dictGet('users_dict', 'Location', CAST(OwnerUserId, 'UInt64')) AS location,
        count() AS c
FROM posts
WHERE location != ''
GROUP BY location
ORDER BY c DESC
LIMIT 5

┌─location───────────────┬──────c─┐
│ India                  │ 787814 │
│ Germany                │ 685347 │
│ United States          │ 595818 │
│ London, United Kingdom │ 538738 │
│ United Kingdom         │ 537699 │
└────────────────────────┴────────┘

5 rows in set. Elapsed: 0.763 sec. Processed 59.82 million rows, 239.28 MB (78.40 million rows/s., 313.60 MB/s.)
Peak memory usage: 248.84 MiB.
```

## 인덱스 시간 데이터 풍부화 {#index-time-enrichment}

위의 예에서는 쿼리 시간에 딕셔너리를 사용하여 조인을 제거했습니다. 딕셔너리는 삽입 시 행을 풍부하게 하는 데 사용할 수도 있습니다. 이는 보통 풍부화 값이 변경되지 않고, 딕셔너리를 채우는 데 사용할 수 있는 외부 소스가 존재하는 경우 적절합니다. 이 경우, 삽입 시 행을 풍부하게 함으로써 쿼리 시간에 딕셔너리를 조회하는 것을 피할 수 있습니다.

사용자의 `Location`이 Stack Overflow에서 결코 변경되지 않는다고 가정해 보겠습니다(실제로는 변경됩니다) - 특히 `users` 테이블의 `Location` 컬럼입니다. 지역별로 게시물 테이블에 대한 분석 쿼리를 수행하고 싶다고 가정해 봅시다. 이 테이블에는 `UserId`가 포함되어 있습니다.

딕셔너리는 사용자 ID에서 위치로의 매핑을 제공하며, `users` 테이블에 의해 뒷받침됩니다:

```sql
CREATE DICTIONARY users_dict
(
    `Id` UInt64,
    `Location` String
)
PRIMARY KEY Id
SOURCE(CLICKHOUSE(QUERY 'SELECT Id, Location FROM users WHERE Id >= 0'))
LIFETIME(MIN 600 MAX 900)
LAYOUT(HASHED())
```

> 우리는 `Id < 0`인 사용자를 제외하며, 이를 통해 `Hashed` 딕셔너리 유형을 사용할 수 있게 됩니다. `Id < 0`인 사용자는 시스템 사용자입니다.

게시물 테이블에서 삽입 시간에 이 딕셔너리를 활용하기 위해서는 스키마를 수정해야 합니다:

```sql
CREATE TABLE posts_with_location
(
    `Id` UInt32,
    `PostTypeId` Enum8('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
     ...
    `Location` MATERIALIZED dictGet(users_dict, 'Location', OwnerUserId::'UInt64')
)
ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
```

위의 예에서 `Location`은 `MATERIALIZED` 컬럼으로 선언됩니다. 이는 값이 `INSERT` 쿼리의 일부로 제공되며 항상 계산됨을 의미합니다.

> ClickHouse는 [`DEFAULT` 컬럼](/sql-reference/statements/create/table#default_values)도 지원합니다(값이 제공되지 않을 경우 삽입되거나 계산될 수 있음).

테이블을 채우기 위해 보통 `INSERT INTO SELECT`를 사용하여 S3에서 가져올 수 있습니다:

```sql
INSERT INTO posts_with_location SELECT Id, PostTypeId::UInt8, AcceptedAnswerId, CreationDate, Score, ViewCount, Body, OwnerUserId, OwnerDisplayName, LastEditorUserId, LastEditorDisplayName, LastEditDate, LastActivityDate, Title, Tags, AnswerCount, CommentCount, FavoriteCount, ContentLicense, ParentId, CommunityOwnedDate, ClosedDate FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 36.830 sec. Processed 238.98 million rows, 2.64 GB (6.49 million rows/s., 71.79 MB/s.)
```

우리는 이제 대부분의 게시물이 유래하는 위치의 이름을 얻을 수 있습니다:

```sql
SELECT Location, count() AS c
FROM posts_with_location
WHERE Location != ''
GROUP BY Location
ORDER BY c DESC
LIMIT 4

┌─Location───────────────┬──────c─┐
│ India                  │ 787814 │
│ Germany                │ 685347 │
│ United States          │ 595818 │
│ London, United Kingdom │ 538738 │
└────────────────────────┴────────┘

4 rows in set. Elapsed: 0.142 sec. Processed 59.82 million rows, 1.08 GB (420.73 million rows/s., 7.60 GB/s.)
Peak memory usage: 666.82 MiB.
```

## 고급 딕셔너리 주제 {#advanced-dictionary-topics}

### 딕셔너리 `LAYOUT` 선택하기 {#choosing-the-dictionary-layout}

`LAYOUT` 절은 딕셔너리에 대한 내부 데이터 구조를 제어합니다. 여러 가지 옵션이 존재하며 [여기](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout)에서 문서화되었습니다. 올바른 레이아웃 선택에 대한 몇 가지 팁은 [여기](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout)에서 찾을 수 있습니다.

### 딕셔너리 새로 고침 {#refreshing-dictionaries}

우리는 딕셔너리에 대한 `LIFETIME`을 `MIN 600 MAX 900`으로 지정했습니다. LIFETIME은 딕셔너리의 업데이트 간격으로, 여기서 값은 600초와 900초 사이의 무작위 간격으로 주기적인 로드를 발생시킵니다. 이 무작위 간격은 많은 서버에서 업데이트할 때 딕셔너리 소스에 대한 부하를 분산시키는 데 필요합니다. 업데이트 중에는 딕셔너리의 이전 버전을 여전히 쿼리할 수 있으며, 오직 초기 로드만 쿼리를 차단합니다. `(LIFETIME(0))`을 설정하면 딕셔너리가 업데이트되지 않도록 방지합니다.
딕셔너리는 `SYSTEM RELOAD DICTIONARY` 명령을 사용하여 강제로 다시 로드할 수 있습니다.

ClickHouse 및 Postgres와 같은 데이터베이스 소스의 경우, 변경 사항이 실제로 있을 때만 딕셔너리를 업데이트할 쿼리를 설정할 수 있습니다(쿼리의 응답이 이를 판단), 주기적인 간격이 아니라. 추가 세부정보는 [여기](https://sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime)에서 확인할 수 있습니다.

### 기타 딕셔너리 유형 {#other-dictionary-types}

ClickHouse는 또한 [Hierarchical](/sql-reference/dictionaries#hierarchical-dictionaries), [Polygon](/sql-reference/dictionaries#polygon-dictionaries) 및 [정규 표현식](/sql-reference/dictionaries#regexp-tree-dictionary) 딕셔너리를 지원합니다.

### 더 읽어보기 {#more-reading}

- [딕셔너리를 사용하여 쿼리 가속화](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [딕셔너리에 대한 고급 구성](/sql-reference/dictionaries)
