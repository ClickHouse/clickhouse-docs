---
description: 'ClickHouse로 Stack Overflow 데이터 분석하기'
sidebar_label: 'Stack Overflow'
slug: /getting-started/example-datasets/stackoverflow
title: 'ClickHouse로 Stack Overflow 데이터 분석하기'
keywords: ['StackOverflow']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import stackoverflow from '@site/static/images/getting-started/example-datasets/stackoverflow.png'

이 데이터셋에는 Stack Overflow에서 발생한 모든 `Posts`, `Users`, `Votes`, `Comments`, `Badges`, `PostHistory`, `PostLinks`가 포함되어 있습니다.

사전에 준비된 Parquet 형식의 데이터(2024년 4월까지의 모든 게시물을 포함)를 다운로드하거나, 최신 데이터를 XML 형식으로 다운로드한 후 이를 로드할 수 있습니다. Stack Overflow에서는 이 데이터를 정기적으로 업데이트하며, 과거 기준으로는 약 3개월마다 제공되었습니다.

다음 다이어그램은 Parquet 형식을 가정했을 때 사용 가능한 테이블의 스키마를 보여줍니다.

<Image img={stackoverflow} alt="Stack Overflow 스키마" size="md" />

이 데이터의 스키마 설명은 [여기](https://meta.stackexchange.com/questions/2677/database-schema-documentation-for-the-public-data-dump-and-sede)에서 확인할 수 있습니다.


## 미리 준비된 데이터 \{#pre-prepared-data\}

이 데이터의 사본을 Parquet 포맷으로 제공하며, 2024년 4월 기준으로 최신 상태입니다. ClickHouse 관점에서 행 수(게시물 6천만 개)는 비교적 작은 편이지만, 이 데이터셋에는 상당한 양의 텍스트와 크기가 큰 String 컬럼이 포함되어 있습니다.

```sql
CREATE DATABASE stackoverflow
```

다음 시간 측정값은 `eu-west-2`에 위치한 96 GiB 메모리, 24 vCPU 구성의 ClickHouse Cloud 클러스터에 대한 것입니다. 데이터셋은 `eu-west-3`에 위치해 있습니다.


### 게시글 \{#posts\}

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
ORDER BY (PostTypeId, toDate(CreationDate), CreationDate)

INSERT INTO stackoverflow.posts SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 265.466 sec. Processed 59.82 million rows, 38.07 GB (225.34 thousand rows/s., 143.42 MB/s.)
```

게시물은 연도별 파일로도 제공됩니다. 예: [https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2020.parquet](https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2020.parquet)


### 투표 수 \{#votes\}

```sql
CREATE TABLE stackoverflow.votes
(
    `Id` UInt32,
    `PostId` Int32,
    `VoteTypeId` UInt8,
    `CreationDate` DateTime64(3, 'UTC'),
    `UserId` Int32,
    `BountyAmount` UInt8
)
ENGINE = MergeTree
ORDER BY (VoteTypeId, CreationDate, PostId, UserId)

INSERT INTO stackoverflow.votes SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/*.parquet')

0 rows in set. Elapsed: 21.605 sec. Processed 238.98 million rows, 2.13 GB (11.06 million rows/s., 98.46 MB/s.)
```

투표 데이터는 연도별로도 제공됩니다. 예를 들어 [https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/2020.parquet](https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/2020.parquet)


### 댓글 \{#comments\}

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

INSERT INTO stackoverflow.comments SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/comments/*.parquet')

0 rows in set. Elapsed: 56.593 sec. Processed 90.38 million rows, 11.14 GB (1.60 million rows/s., 196.78 MB/s.)
```

댓글은 연도별로도 제공됩니다. 예를 들어 [https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/comments/2020.parquet](https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/comments/2020.parquet)과 같습니다.


### 사용자 \{#users\}

```sql
CREATE TABLE stackoverflow.users
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

INSERT INTO stackoverflow.users SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/users.parquet')

0 rows in set. Elapsed: 10.988 sec. Processed 22.48 million rows, 1.36 GB (2.05 million rows/s., 124.10 MB/s.)
```


### Badges \{#badges\}

```sql
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

INSERT INTO stackoverflow.badges SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 6.635 sec. Processed 51.29 million rows, 797.05 MB (7.73 million rows/s., 120.13 MB/s.)
```


### PostLinks \{#postlinks\}

```sql
CREATE TABLE stackoverflow.postlinks
(
    `Id` UInt64,
    `CreationDate` DateTime64(3, 'UTC'),
    `PostId` Int32,
    `RelatedPostId` Int32,
    `LinkTypeId` Enum8('Linked' = 1, 'Duplicate' = 3)
)
ENGINE = MergeTree
ORDER BY (PostId, RelatedPostId)

INSERT INTO stackoverflow.postlinks SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/postlinks.parquet')

0 rows in set. Elapsed: 1.534 sec. Processed 6.55 million rows, 129.70 MB (4.27 million rows/s., 84.57 MB/s.)
```


### PostHistory(게시 기록) \{#posthistory\}

```sql
CREATE TABLE stackoverflow.posthistory
(
    `Id` UInt64,
    `PostHistoryTypeId` UInt8,
    `PostId` Int32,
    `RevisionGUID` String,
    `CreationDate` DateTime64(3, 'UTC'),
    `UserId` Int32,
    `Text` String,
    `ContentLicense` LowCardinality(String),
    `Comment` String,
    `UserDisplayName` String
)
ENGINE = MergeTree
ORDER BY (CreationDate, PostId)

INSERT INTO stackoverflow.posthistory SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posthistory/*.parquet')

0 rows in set. Elapsed: 422.795 sec. Processed 160.79 million rows, 67.08 GB (380.30 thousand rows/s., 158.67 MB/s.)
```


## 원본 데이터셋 \{#original-dataset\}

원본 데이터셋은 7zip으로 압축된 XML 형식으로 [https://archive.org/download/stackexchange](https://archive.org/download/stackexchange)에서 `stackoverflow.com*` 접두사가 붙은 파일로 제공됩니다.

### 다운로드 \{#download\}

```bash
wget https://archive.org/download/stackexchange/stackoverflow.com-Badges.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-Comments.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-PostHistory.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-PostLinks.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-Posts.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-Users.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-Votes.7z
```

이 파일의 크기는 최대 35GB이며, 인터넷 연결 상태에 따라 다운로드에 약 30분이 걸릴 수 있습니다. 다운로드 서버는 대략 20MB/초 정도로 속도를 제한합니다.


### JSON으로 변환 \{#convert-to-json\}

현재 기준으로 ClickHouse는 입력 포맷으로 XML을 네이티브하게 지원하지 않습니다. 데이터를 ClickHouse로 적재하기 위해 먼저 NDJSON으로 변환합니다.

XML을 JSON으로 변환하기 위해서는 XML 문서를 처리하기 위한 간단한 `jq` 래퍼인 리눅스 도구 [`xq`](https://github.com/kislyuk/yq)를 사용할 것을 권장합니다.

xq와 jq를 설치하십시오:

```bash
sudo apt install jq
pip install yq
```

다음 단계는 위에 나열된 모든 파일에 동일하게 적용됩니다. 여기서는 예시로 `stackoverflow.com-Posts.7z` 파일을 사용합니다. 필요에 따라 수정하십시오.

[p7zip](https://p7zip.sourceforge.net/)을 사용하여 파일을 압축 해제합니다. 그러면 단일 xml 파일이 생성되며, 이 예시에서는 `Posts.xml`이 생성됩니다.

> 파일은 약 4.5배 정도로 압축되어 있습니다. 22GB로 압축된 경우, posts 파일은 압축 해제 시 약 97GB의 공간이 필요합니다.

```bash
p7zip -d stackoverflow.com-Posts.7z
```

다음 예시는 XML 파일을 각 10000개의 행을 포함하는 여러 파일로 분할합니다.

```bash
mkdir posts
cd posts
# the following splits the input xml file into sub files of 10000 rows
tail +3 ../Posts.xml | head -n -1 | split -l 10000 --filter='{ printf "<rows>\n"; cat - ; printf "</rows>\n"; } > $FILE' -
```

위 명령을 실행한 후에는 각 10000줄이 들어 있는 여러 개의 파일을 얻게 됩니다. 이렇게 하면 다음 명령의 메모리 오버헤드가 과도해지지 않습니다 (XML에서 JSON으로의 변환은 메모리에서 수행됩니다).

```bash
find . -maxdepth 1 -type f -exec xq -c '.rows.row[]' {} \; | sed -e 's:"@:":g' > posts_v2.json
```

위 명령은 단일 `posts.json` 파일을 생성합니다.

다음 명령으로 ClickHouse에 로드합니다. `posts.json` 파일에 대한 스키마가 지정되어 있다는 점에 유의하십시오. 대상 테이블과 일치하도록 데이터 타입별로 이를 조정해야 합니다.

```bash
clickhouse local --query "SELECT * FROM file('posts.json', JSONEachRow, 'Id Int32, PostTypeId UInt8, AcceptedAnswerId UInt32, CreationDate DateTime64(3, \'UTC\'), Score Int32, ViewCount UInt32, Body String, OwnerUserId Int32, OwnerDisplayName String, LastEditorUserId Int32, LastEditorDisplayName String, LastEditDate DateTime64(3, \'UTC\'), LastActivityDate DateTime64(3, \'UTC\'), Title String, Tags String, AnswerCount UInt16, CommentCount UInt8, FavoriteCount UInt8, ContentLicense String, ParentId String, CommunityOwnedDate DateTime64(3, \'UTC\'), ClosedDate DateTime64(3, \'UTC\')') FORMAT Native" | clickhouse client --host <host> --secure --password <password> --query "INSERT INTO stackoverflow.posts_v2 FORMAT Native"
```


## 예제 쿼리 \{#example-queries\}

시작하는 데 도움이 되는 간단한 예제 쿼리입니다.

### Stack Overflow에서 가장 인기 있는 태그 \{#most-popular-tags-on-stack-overflow\}

```sql

SELECT
    arrayJoin(arrayFilter(t -> (t != ''), splitByChar('|', Tags))) AS Tags,
    count() AS c
FROM stackoverflow.posts
GROUP BY Tags
ORDER BY c DESC
LIMIT 10

┌─Tags───────┬───────c─┐
│ javascript │ 2527130 │
│ python     │ 2189638 │
│ java       │ 1916156 │
│ c#         │ 1614236 │
│ php        │ 1463901 │
│ android    │ 1416442 │
│ html       │ 1186567 │
│ jquery     │ 1034621 │
│ c++        │  806202 │
│ css        │  803755 │
└────────────┴─────────┘

10 rows in set. Elapsed: 1.013 sec. Processed 59.82 million rows, 1.21 GB (59.07 million rows/s., 1.19 GB/s.)
Peak memory usage: 224.03 MiB.
```


### 답변 수가 가장 많은 사용자(활성 계정 기준) \{#user-with-the-most-answers-active-accounts\}

계정에는 `UserId`가 있어야 합니다.

```sql
SELECT
    any(OwnerUserId) UserId,
    OwnerDisplayName,
    count() AS c
FROM stackoverflow.posts WHERE OwnerDisplayName != '' AND PostTypeId='Answer' AND OwnerUserId != 0
GROUP BY OwnerDisplayName
ORDER BY c DESC
LIMIT 5

┌─UserId─┬─OwnerDisplayName─┬────c─┐
│  22656 │ Jon Skeet        │ 2727 │
│  23354 │ Marc Gravell     │ 2150 │
│  12950 │ tvanfosson       │ 1530 │
│   3043 │ Joel Coehoorn    │ 1438 │
│  10661 │ S.Lott           │ 1087 │
└────────┴──────────────────┴──────┘

5 rows in set. Elapsed: 0.154 sec. Processed 35.83 million rows, 193.39 MB (232.33 million rows/s., 1.25 GB/s.)
Peak memory usage: 206.45 MiB.
```


### 조회수가 가장 많은 ClickHouse 관련 게시물 \{#clickhouse-related-posts-with-the-most-views\}

```sql
SELECT
    Id,
    Title,
    ViewCount,
    AnswerCount
FROM stackoverflow.posts
WHERE Title ILIKE '%ClickHouse%'
ORDER BY ViewCount DESC
LIMIT 10

┌───────Id─┬─Title────────────────────────────────────────────────────────────────────────────┬─ViewCount─┬─AnswerCount─┐
│ 52355143 │ Is it possible to delete old records from clickhouse table?                      │     41462 │           3 │
│ 37954203 │ Clickhouse Data Import                                                           │     38735 │           3 │
│ 37901642 │ Updating data in Clickhouse                                                      │     36236 │           6 │
│ 58422110 │ Pandas: How to insert dataframe into Clickhouse                                  │     29731 │           4 │
│ 63621318 │ DBeaver - Clickhouse - SQL Error [159] .. Read timed out                         │     27350 │           1 │
│ 47591813 │ How to filter clickhouse table by array column contents?                         │     27078 │           2 │
│ 58728436 │ How to search the string in query with case insensitive on Clickhouse database?  │     26567 │           3 │
│ 65316905 │ Clickhouse: DB::Exception: Memory limit (for query) exceeded                     │     24899 │           2 │
│ 49944865 │ How to add a column in clickhouse                                                │     24424 │           1 │
│ 59712399 │ How to cast date Strings to DateTime format with extended parsing in ClickHouse? │     22620 │           1 │
└──────────┴──────────────────────────────────────────────────────────────────────────────────┴───────────┴─────────────┘

10 rows in set. Elapsed: 0.472 sec. Processed 59.82 million rows, 1.91 GB (126.63 million rows/s., 4.03 GB/s.)
Peak memory usage: 240.01 MiB.
```


### 가장 논란이 된 게시물 \{#most-controversial-posts\}

```sql
SELECT
    Id,
    Title,
    UpVotes,
    DownVotes,
    abs(UpVotes - DownVotes) AS Controversial_ratio
FROM stackoverflow.posts
INNER JOIN
(
    SELECT
        PostId,
        countIf(VoteTypeId = 2) AS UpVotes,
        countIf(VoteTypeId = 3) AS DownVotes
    FROM stackoverflow.votes
    GROUP BY PostId
    HAVING (UpVotes > 10) AND (DownVotes > 10)
) AS votes ON posts.Id = votes.PostId
WHERE Title != ''
ORDER BY Controversial_ratio ASC
LIMIT 3

┌───────Id─┬─Title─────────────────────────────────────────────┬─UpVotes─┬─DownVotes─┬─Controversial_ratio─┐
│   583177 │ VB.NET Infinite For Loop                          │      12 │        12 │                   0 │
│  9756797 │ Read console input as enumerable - one statement? │      16 │        16 │                   0 │
│ 13329132 │ What's the point of ARGV in Ruby?                 │      22 │        22 │                   0 │
└──────────┴───────────────────────────────────────────────────┴─────────┴───────────┴─────────────────────┘

3 rows in set. Elapsed: 4.779 sec. Processed 298.80 million rows, 3.16 GB (62.52 million rows/s., 661.05 MB/s.)
Peak memory usage: 6.05 GiB.
```


## 출처 표기 \{#attribution\}

Stack Overflow에서 이 데이터를 `cc-by-sa 4.0` 라이선스로 제공해 준 것에 감사드리며, 그 노력과 [https://archive.org/details/stackexchange](https://archive.org/details/stackexchange)에 있는 원본 데이터 출처를 함께 밝힙니다.