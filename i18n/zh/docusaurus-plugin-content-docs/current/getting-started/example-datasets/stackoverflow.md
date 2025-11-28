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

该数据集包含在 Stack Overflow 上产生的所有 `Posts`、`Users`、`Votes`、`Comments`、`Badges`、`PostHistory` 和 `PostLinks` 记录。

用户可以下载预先生成的 Parquet 版本数据集（包含截至 2024 年 4 月的所有帖子），或下载最新的 XML 格式数据并自行加载。Stack Overflow 会定期发布这些数据的更新——通常每 3 个月一次。

下图展示了在使用 Parquet 格式时，可用数据表的模式。

<Image img={stackoverflow} alt="Stack Overflow schema" size="md" />

该数据集的模式说明可在[此处](https://meta.stackexchange.com/questions/2677/database-schema-documentation-for-the-public-data-dump-and-sede)找到。


## 预置数据

我们提供了一份 Parquet 格式的数据副本，内容更新至 2024 年 4 月。虽然从行数规模来看（6,000 万条帖子），这个数据集对 ClickHouse 来说并不算大，但其中包含了大量文本以及体积较大的 String 类型列。

```sql
CREATE DATABASE stackoverflow
```

以下时间测试结果基于一个位于 `eu-west-2`、具有 96 GiB 内存和 24 个 vCPU 的 ClickHouse Cloud 集群。数据集位于 `eu-west-3`。


### 文章

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

Posts 数据集也可以按年份获取，例如 [https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2020.parquet](https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2020.parquet)


### 投票

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

投票数据也可以按年份获取，例如：[https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2020.parquet](https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/2020.parquet)


### 评论

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

评论数据也可以按年份获取，例如：[https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/2020.parquet](https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/comments/2020.parquet)


### 用户

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


### 徽章

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

返回 0 行。用时:6.635 秒。已处理 5129 万行,797.05 MB(773 万行/秒,120.13 MB/秒)
```


### 文章链接

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


### PostHistory

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

原始数据集以压缩的 7-Zip XML 格式提供，可从 [https://archive.org/download/stackexchange](https://archive.org/download/stackexchange) 获取，文件前缀为 `stackoverflow.com*`。

### 下载

```bash
wget https://archive.org/download/stackexchange/stackoverflow.com-Badges.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-Comments.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-PostHistory.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-PostLinks.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-Posts.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-Users.7z
wget https://archive.org/download/stackexchange/stackoverflow.com-Votes.7z
```

这些文件大小可达 35GB，具体下载时间取决于网络状况，大约需要 30 分钟——下载服务器的限速约为 20 MB/秒。


### 转换为 JSON

在撰写本文时，ClickHouse 暂不原生支持将 XML 作为输入格式。要将数据加载到 ClickHouse，我们首先将其转换为 NDJSON。

要将 XML 转换为 JSON，我们推荐使用 [`xq`](https://github.com/kislyuk/yq) 这个 Linux 工具，它是一个针对 XML 文档的简单 `jq` 封装。

安装 xq 和 jq：

```bash
sudo apt install jq
pip install yq
```

以下步骤适用于上述任意一个文件。这里以 `stackoverflow.com-Posts.7z` 文件为例，请根据需要进行调整。

使用 [p7zip](https://p7zip.sourceforge.net/) 解压该文件。解压后会生成一个单个的 XML 文件——在本例中为 `Posts.xml`。

> 文件压缩率大约为 4.5 倍。帖子文件压缩后约为 22GB，解压后大约需要 97GB 的空间。

```bash
p7zip -d stackoverflow.com-Posts.7z
```

以下操作会将该 XML 文件拆分为多个文件，每个文件包含 10000 行。

```bash
mkdir posts
cd posts
# 以下命令将输入的 XML 文件拆分为每个 10000 行的子文件
tail +3 ../Posts.xml | head -n -1 | split -l 10000 --filter='{ printf "<rows>\n"; cat - ; printf "</rows>\n"; } > $FILE' -
```

在运行上述命令后，用户会得到一组文件，每个文件包含 10,000 行。这样可以确保下一条命令的内存开销不会过大（XML 到 JSON 的转换是在内存中完成的）。

```bash
find . -maxdepth 1 -type f -exec xq -c '.rows.row[]' {} \; | sed -e 's:"@:":g' > posts_v2.json
```

上述命令会生成一个 `posts.json` 文件。

使用以下命令将其加载到 ClickHouse 中。注意，这里为 `posts.json` 文件指定了 schema。你需要根据数据类型对其进行相应调整，使其与目标表保持一致。

```bash
clickhouse local --query "SELECT * FROM file('posts.json', JSONEachRow, 'Id Int32, PostTypeId UInt8, AcceptedAnswerId UInt32, CreationDate DateTime64(3, \'UTC\'), Score Int32, ViewCount UInt32, Body String, OwnerUserId Int32, OwnerDisplayName String, LastEditorUserId Int32, LastEditorDisplayName String, LastEditDate DateTime64(3, \'UTC\'), LastActivityDate DateTime64(3, \'UTC\'), Title String, Tags String, AnswerCount UInt16, CommentCount UInt8, FavoriteCount UInt8, ContentLicense String, ParentId String, CommunityOwnedDate DateTime64(3, \'UTC\'), ClosedDate DateTime64(3, \'UTC\')') FORMAT Native" | clickhouse client --host <host> --secure --password <password> --query "INSERT INTO stackoverflow.posts_v2 FORMAT Native"
```


## 示例查询 {#example-queries}

下面是一些简单的查询示例，帮助你开始使用。

### Stack Overflow 上最常用的标签

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

返回了 10 行。耗时：1.013 秒。处理了 5982 万行，1.21 GB（5907 万行/秒，1.19 GB/秒）。
峰值内存使用：224.03 MiB。
```


### 回答数最多的用户（活跃账户）

账户必须包含 `UserId`。

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

返回 5 行。耗时：0.154 秒。处理了 35.83 百万行，193.39 MB（232.33 百万行/秒，1.25 GB/秒）。
峰值内存使用：206.45 MiB。
```


### 阅读量最高的 ClickHouse 相关文章

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
│ 52355143 │ 是否可以从 ClickHouse 表中删除旧记录?                      │     41462 │           3 │
│ 37954203 │ ClickHouse 数据导入                                                           │     38735 │           3 │
│ 37901642 │ 在 ClickHouse 中更新数据                                                      │     36236 │           6 │
│ 58422110 │ Pandas: 如何将 DataFrame 插入 ClickHouse                                  │     29731 │           4 │
│ 63621318 │ DBeaver - ClickHouse - SQL 错误 [159] .. 读取超时                         │     27350 │           1 │
│ 47591813 │ 如何根据数组列内容过滤 ClickHouse 表?                         │     27078 │           2 │
│ 58728436 │ 如何在 ClickHouse 数据库中执行不区分大小写的字符串查询?  │     26567 │           3 │
│ 65316905 │ ClickHouse: DB::Exception: 内存限制(查询)已超出                     │     24899 │           2 │
│ 49944865 │ 如何在 ClickHouse 中添加列                                                │     24424 │           1 │
│ 59712399 │ 如何在 ClickHouse 中使用扩展解析将日期字符串转换为 DateTime 格式? │     22620 │           1 │
└──────────┴──────────────────────────────────────────────────────────────────────────────────┴───────────┴─────────────┘

返回 10 行。用时:0.472 秒。处理了 5982 万行,1.91 GB(每秒 1.2663 亿行,4.03 GB/秒)。
峰值内存使用量:240.01 MiB。
```


### 最具争议的帖子

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

返回 3 行。用时:4.779 秒。已处理 2.988 亿行,3.16 GB(6252 万行/秒,661.05 MB/秒)。
内存峰值:6.05 GiB。
```


## 致谢 {#attribution}

我们感谢 Stack Overflow 按照 `cc-by-sa 4.0` 许可证提供这些数据，并对其付出和在 [https://archive.org/details/stackexchange](https://archive.org/details/stackexchange) 提供的原始数据来源表示认可。