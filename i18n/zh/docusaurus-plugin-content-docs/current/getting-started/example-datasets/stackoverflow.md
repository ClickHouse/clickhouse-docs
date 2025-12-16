---
description: '使用 ClickHouse 分析 Stack Overflow 数据'
sidebar_label: 'Stack Overflow'
slug: /getting-started/example-datasets/stackoverflow
title: '使用 ClickHouse 分析 Stack Overflow 数据'
keywords: ['StackOverflow']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import stackoverflow from '@site/static/images/getting-started/example-datasets/stackoverflow.png'

此数据集包含在 Stack Overflow 上出现过的所有 `Posts`、`Users`、`Votes`、`Comments`、`Badges`、`PostHistory` 和 `PostLinks`。

你可以下载预先准备好的 Parquet 格式数据（包含截至 2024 年 4 月的所有帖子），或者下载最新的 XML 格式数据并自行加载。Stack Overflow 会定期更新这些数据——过去通常为每 3 个月一次。

下图展示了在采用 Parquet 格式时可用数据表的 schema。

<Image img={stackoverflow} alt="Stack Overflow schema" size="md" />

关于这些数据的 schema 说明可以在[这里](https://meta.stackexchange.com/questions/2677/database-schema-documentation-for-the-public-data-dump-and-sede)找到。


## 预置数据 {#pre-prepared-data}

我们提供了一份 Parquet 格式的数据副本，数据更新至 2024 年 4 月。就行数（6000 万条帖子）而言，这个数据集对 ClickHouse 来说规模较小，但其中包含大量文本以及体积较大的 String 列。

```sql
CREATE DATABASE stackoverflow
```

以下所示耗时基于一个位于 `eu-west-2`、配置为 96 GiB 内存和 24 vCPU 的 ClickHouse Cloud 集群。数据集位于 `eu-west-3`。


### 帖子 {#posts}

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

帖子数据也可以按年份获取，例如 [https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2020.parquet](https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2020.parquet)


### 投票 {#votes}

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

投票记录也可以按年份获取，例如：[https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2020.parquet](https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/2020.parquet)


### 评论 {#comments}

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

评论同样可以按年份获取，例如 [https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2020.parquet](https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/comments/2020.parquet)


### 用户 {#users}

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


### Badges（徽章） {#badges}

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


### PostLinks {#postlinks}

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


### PostHistory {#posthistory}

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


## 原始数据集 {#original-dataset}

原始数据集以压缩（7zip）XML 格式提供，可从 [https://archive.org/download/stackexchange](https://archive.org/download/stackexchange) 下载，对应的文件前缀为 `stackoverflow.com*`。

### 下载 {#download}

```bash
wget https://archive.org/download/stackexchange/stackoverflow.com-Badges.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-Comments.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-PostHistory.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-PostLinks.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-Posts.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-Users.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-Votes.7z
```

这些文件大小可达 35GB，下载可能需要约 30 分钟，具体取决于网络状况——下载服务器的限速大约为 20 MB/s。


### 转换为 JSON {#convert-to-json}

在撰写本文时，ClickHouse 尚不支持原生将 XML 作为输入格式。要将数据加载到 ClickHouse，我们首先需要将其转换为 NDJSON。

要将 XML 转换为 JSON，我们推荐使用 [`xq`](https://github.com/kislyuk/yq) 这个 Linux 工具，它是针对 XML 文档的一个简单 `jq` 封装。

安装 xq 和 jq：

```bash
sudo apt install jq
pip install yq
```

以下步骤适用于上述任一文件。这里以 `stackoverflow.com-Posts.7z` 文件为例，根据需要进行相应修改。

使用 [p7zip](https://p7zip.sourceforge.net/) 解压文件，会生成一个单个 XML 文件——在本例中为 `Posts.xml`。

> 文件的压缩率约为 4.5 倍。`Posts` 文件压缩后约为 22GB，解压后大约需要 97GB 空间。

```bash
p7zip -d stackoverflow.com-Posts.7z
```

下面的操作会将该 XML 文件拆分成多个文件，每个文件包含 10000 行。

```bash
mkdir posts
cd posts
# the following splits the input xml file into sub files of 10000 rows
tail +3 ../Posts.xml | head -n -1 | split -l 10000 --filter='{ printf "<rows>\n"; cat - ; printf "</rows>\n"; } > $FILE' -
```

执行完上述操作后，将得到一组文件，每个文件包含 10000 行。这样可以确保后续命令的内存开销不会过大（XML 到 JSON 的转换是在内存中完成的）。

```bash
find . -maxdepth 1 -type f -exec xq -c '.rows.row[]' {} \; | sed -e 's:"@:":g' > posts_v2.json
```

上述命令将生成一个 `posts.json` 文件。

使用以下命令将其加载到 ClickHouse 中。请注意，这里为 `posts.json` 文件显式指定了 schema（模式）。需要根据各字段的数据类型进行调整，以与目标表的定义保持一致。

```bash
clickhouse local --query "SELECT * FROM file('posts.json', JSONEachRow, 'Id Int32, PostTypeId UInt8, AcceptedAnswerId UInt32, CreationDate DateTime64(3, \'UTC\'), Score Int32, ViewCount UInt32, Body String, OwnerUserId Int32, OwnerDisplayName String, LastEditorUserId Int32, LastEditorDisplayName String, LastEditDate DateTime64(3, \'UTC\'), LastActivityDate DateTime64(3, \'UTC\'), Title String, Tags String, AnswerCount UInt16, CommentCount UInt8, FavoriteCount UInt8, ContentLicense String, ParentId String, CommunityOwnedDate DateTime64(3, \'UTC\'), ClosedDate DateTime64(3, \'UTC\')') FORMAT Native" | clickhouse client --host <host> --secure --password <password> --query "INSERT INTO stackoverflow.posts_v2 FORMAT Native"
```


## 示例查询 {#example-queries}

以下是一些简单的查询示例，帮助你开始使用。

### Stack Overflow 上最热门的标签 {#most-popular-tags-on-stack-overflow}

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


### 回答数最多的用户（活跃账户） {#user-with-the-most-answers-active-accounts}

账户需要包含一个 `UserId`。

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


### 浏览量最高的 ClickHouse 相关帖子 {#clickhouse-related-posts-with-the-most-views}

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


### 最具争议的帖子 {#most-controversial-posts}

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


## 致谢 {#attribution}

我们感谢 Stack Overflow 依据 `cc-by-sa 4.0` 许可协议提供这些数据，并在此致谢他们的付出以及数据的原始来源：[https://archive.org/details/stackexchange](https://archive.org/details/stackexchange)。