---
slug: /data-modeling/denormalization
title: 数据反规范化
description: 如何使用反规范化来提高查询性能
keywords: ['data denormalization', 'denormalize', 'query optimization']
---

import denormalizationDiagram from '@site/static/images/data-modeling/denormalization-diagram.png';
import denormalizationSchema from '@site/static/images/data-modeling/denormalization-schema.png';


# 数据反规范化

数据反规范化是 ClickHouse 中的一种技术，利用扁平化表格来帮助最小化查询延迟，从而避免连接操作。

## 比较规范化与反规范化模式 {#comparing-normalized-vs-denormalized-schemas}

反规范化数据涉及故意逆转规范化过程，以优化数据库对特定查询模式的性能。在规范化数据库中，数据被拆分成多个相关表，以最小化冗余并确保数据完整性。反规范化通过合并表格、复制数据和将计算字段合并到单个表格或更少的表格中重新引入冗余——有效地将查询时的任何连接移至插入时。

这一过程减少了查询时对复杂连接的需求，可以显著加快读取操作，非常适合具有重读需求和复杂查询的应用。然而，这可能会增加写入操作和维护的复杂性，因为对重复数据的任何更改都必须传播到所有实例以维持一致性。

<img src={denormalizationDiagram} class="image" alt="ClickHouse中的反规范化" style={{width: '100%', background: 'none'}} />

<br />

一种被 NoSQL 解决方案推广的常用技术是在缺乏 `JOIN` 支持的情况下反规范化数据，有效地将所有统计信息或相关行存储在父行中作为列和嵌套对象。例如，在一个博客的示例模式中，我们可以将所有 `Comments` 存储为其各自帖子上的一个 `Array` 对象。

## 何时使用反规范化 {#when-to-use-denormalization}

一般来说，我们建议在以下情况下进行反规范化：

- 反规范化那些不经常变化的表，或者可以容忍数据在进行分析查询之前有延迟的情况，即数据可以在批处理过程中完全重新加载。
- 避免对多对多关系进行反规范化。这可能导致如果单个源行发生变化则需要更新许多行。
- 避免对高基数关系进行反规范化。如果表中的每行在另一个表中有数千个相关条目，这些条目将需要表示为 `Array`——无论是原始类型还是元组。通常不推荐使用包含超过 1000 元组的数组。
- 不必将所有列反规范化为嵌套对象，可以考虑仅使用物化视图反规范化一个统计值（见下文）。

并非所有信息都需要反规范化——只需反规范化那些需要频繁访问的关键信息。

反规范化工作可以在 ClickHouse 或上游处理，例如使用 Apache Flink。

## 避免对频繁更新的数据进行反规范化 {#avoid-denormalization-on-frequently-updated-data}

对 ClickHouse 来说，反规范化是用户可以用来优化查询性能的几种选择之一，但应谨慎使用。如果数据频繁更新并且需要近实时更新，则应避免使用这种方法。如果主表主要是追加的或可以定期以批处理的方式重新加载（例如，每天），则可以使用此方法。

作为一种方法，它面临一个主要挑战——写入性能和更新数据。更具体地说，反规范化有效地将数据连接的责任从查询时间移至摄取时间。虽然这可以显著提高查询性能，但使得摄取复杂化，并且这意味着，如果用于构成它的任何行发生变化，则数据管道需要重新插入这行到 ClickHouse。这可能意味着一个源行的变化可能需要更新 ClickHouse 中的多行。在复杂模式中，当行是从复杂连接中构成时，连接中嵌套组件的单行更改可能意味着需要更新数百万行。

在实时实现这一点往往不切实际，需要有显著的工程投入，因为存在两个挑战：

1. 当表行发生变化时，触发正确的连接语句。理想情况下，这不应导致连接的所有对象都被更新，而只是那些受到影响的对象。为正确的行过滤修改连接，并在高吞吐量下实现这一点，需要外部工具或工程。
2. ClickHouse 中的行更新需要小心管理，增加了额外的复杂性。

<br />

因此，更常见的是批量更新过程，其中所有反规范化对象定期重新加载。

## 反规范化的实际案例 {#practical-cases-for-denormalization}

让我们考虑几个反规范化可能有意义的实际示例，以及更理想的替代方法。

考虑一个 `Posts` 表，该表已经被反规范化，包含如 `AnswerCount` 和 `CommentCount` 之类的统计信息——源数据就是以这种形式提供的。实际上，我们可能希望对这些信息进行规范化，因为它们可能会经常变化。许多这些列也可以通过其他表访问，例如，帖子的评论可以通过 `PostId` 列和 `Comments` 表获得。出于示例目的，我们假设帖子是以批处理过程重新加载的。

我们还只考虑将其他表反规范化到 `Posts` 上，因为我们视其为主要分析表。反规范化到另一个方向对于某些查询也是适用的，适用上述相同的考虑。

*对于以下每个示例，请假设存在一个查询需要同时使用这两个表。*

### 帖子和投票 {#posts-and-votes}

帖子投票以单独的表表示。优化的模式如下所示，以及加载数据的插入命令：

```sql
CREATE TABLE votes
(
	`Id` UInt32,
	`PostId` Int32,
	`VoteTypeId` UInt8,
	`CreationDate` DateTime64(3, 'UTC'),
	`UserId` Int32,
	`BountyAmount` UInt8
)
ENGINE = MergeTree
ORDER BY (VoteTypeId, CreationDate, PostId)

INSERT INTO votes SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/*.parquet')

0 rows in set. Elapsed: 26.272 sec. Processed 238.98 million rows, 2.13 GB (9.10 million rows/s., 80.97 MB/s.)
```

乍一看，这些可能是帖子表的反规范化候选。然而，这种方法存在一些挑战。

帖子投票很频繁地被添加到帖子中。尽管随着时间的推移每个帖子的投票量可能会减少，但以下查询显示，我们每小时大约有 4 万个投票，涉及 3 万个帖子。

```sql
SELECT round(avg(c)) AS avg_votes_per_hr, round(avg(posts)) AS avg_posts_per_hr
FROM
(
	SELECT
    	toStartOfHour(CreationDate) AS hr,
    	count() AS c,
    	uniq(PostId) AS posts
	FROM votes
	GROUP BY hr
)

┌─avg_votes_per_hr─┬─avg_posts_per_hr─┐
│        	41759 │        	33322 │
└──────────────────┴──────────────────┘
```

如果可以容忍延迟，这可以通过批处理来解决，但这仍然需要我们处理更新，除非我们定期重新加载所有帖子（这不太可能是可取的）。

更麻烦的是一些帖子有极高数量的投票：

```sql
SELECT PostId, concat('https://stackoverflow.com/questions/', PostId) AS url, count() AS c
FROM votes
GROUP BY PostId
ORDER BY c DESC
LIMIT 5

┌───PostId─┬─url──────────────────────────────────────────┬─────c─┐
│ 11227902 │ https://stackoverflow.com/questions/11227902 │ 35123 │
│   927386 │ https://stackoverflow.com/questions/927386   │ 29090 │
│ 11227809 │ https://stackoverflow.com/questions/11227809 │ 27475 │
│   927358 │ https://stackoverflow.com/questions/927358   │ 26409 │
│  2003515 │ https://stackoverflow.com/questions/2003515  │ 25899 │
└──────────┴──────────────────────────────────────────────┴───────┘
```

主要的观察点是，针对每个帖子的汇总投票统计对于大多数分析来说是足够的——我们不需要反规范化所有的投票信息。例如，当前的 `Score` 列代表了这种统计，即总的赞成票减去反对票。理想情况下，我们只需在查询时通过简单查找获取这些统计信息（见 [字典](/dictionary)）。

### 用户和徽章 {#users-and-badges}

现在让我们考虑我们的 `Users` 和 `Badges`：

<img src={denormalizationSchema} class="image" alt="用户和徽章模式" style={{width: '100%', background: 'none'}} />

<p></p>
我们首先使用以下命令插入数据：
<p></p>

```sql
CREATE TABLE users
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
```

```sql
CREATE TABLE badges
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

INSERT INTO users SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/users.parquet')

0 rows in set. Elapsed: 26.229 sec. Processed 22.48 million rows, 1.36 GB (857.21 thousand rows/s., 51.99 MB/s.)

INSERT INTO badges SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 18.126 sec. Processed 51.29 million rows, 797.05 MB (2.83 million rows/s., 43.97 MB/s.)
```

虽然用户可能频繁获得徽章，但这不太可能是一个我们需要每天更新多次的数据集。徽章与用户之间的关系是多对一的。也许我们可以仅将徽章反规范化到用户上，作为元组列表？虽然可以，但对每个用户的徽章数量的快速检查表明，这并不理想：

```sql
SELECT UserId, count() AS c FROM badges GROUP BY UserId ORDER BY c DESC LIMIT 5

┌─UserId─┬─────c─┐
│  22656 │ 19334 │
│   6309 │ 10516 │
│ 100297 │  7848 │
│ 157882 │  7574 │
│  29407 │  6512 │
└────────┴───────┘
```

将 19k 个对象反规范化到单行上可能并不现实。此关系可能最好保持为单独的表或添加统计信息。

> 我们可能希望将徽章的统计信息反规范化到用户上，例如徽章数量。我们在插入时使用字典对该数据集进行这种例子的考虑。

### 帖子和 PostLinks {#posts-and-postlinks}

`PostLinks` 连接用户认为相关或重复的 `Posts`。以下查询显示了模式和加载命令：

```sql
CREATE TABLE postlinks
(
  `Id` UInt64,
  `CreationDate` DateTime64(3, 'UTC'),
  `PostId` Int32,
  `RelatedPostId` Int32,
  `LinkTypeId` Enum('Linked' = 1, 'Duplicate' = 3)
)
ENGINE = MergeTree
ORDER BY (PostId, RelatedPostId)

INSERT INTO postlinks SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/postlinks.parquet')

0 rows in set. Elapsed: 4.726 sec. Processed 6.55 million rows, 129.70 MB (1.39 million rows/s., 27.44 MB/s.)
```

我们可以确认没有帖子具有过多的连接，防止反规范化：

```sql
SELECT PostId, count() AS c
FROM postlinks
GROUP BY PostId
ORDER BY c DESC LIMIT 5

┌───PostId─┬───c─┐
│ 22937618 │ 125 │
│  9549780 │ 120 │
│  3737139 │ 109 │
│ 18050071 │ 103 │
│ 25889234 │  82 │
└──────────┴─────┘
```

同样，这些链接不是过于频繁发生的事件：

```sql
SELECT
  round(avg(c)) AS avg_votes_per_hr,
  round(avg(posts)) AS avg_posts_per_hr
FROM
(
  SELECT
  toStartOfHour(CreationDate) AS hr,
  count() AS c,
  uniq(PostId) AS posts
  FROM postlinks
  GROUP BY hr
)

┌─avg_votes_per_hr─┬─avg_posts_per_hr─┐
│      		 54 │      		 44	│
└──────────────────┴──────────────────┘
```

我们使用这个作为下面的反规范化示例。

### 简单统计示例 {#simple-statistic-example}

在大多数情况下，反规范化需要在父行上添加一个单独的列或统计信息。例如，我们可能只想通过重复帖子数量来丰富我们的帖子，因此只需添加一列。

```sql
CREATE TABLE posts_with_duplicate_count
(
  `Id` Int32 CODEC(Delta(4), ZSTD(1)),
   ... -其他列
   `DuplicatePosts` UInt16
) ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
```

为了填充这个表，我们利用 `INSERT INTO SELECT` 将我们的重复统计信息与帖子连接。

```sql
INSERT INTO posts_with_duplicate_count SELECT
    posts.*,
    DuplicatePosts
FROM posts AS posts
LEFT JOIN
(
    SELECT PostId, countIf(LinkTypeId = 'Duplicate') AS DuplicatePosts
    FROM postlinks
    GROUP BY PostId
) AS postlinks ON posts.Id = postlinks.PostId
```

### 利用复杂类型处理一对多关系 {#exploiting-complex-types-for-one-to-many-relationships}

为了执行反规范化，我们往往需要利用复杂类型。如果正在反规范化一对一关系，且列数量较少，用户可以简单地将其作为行添加，保持其原始类型如上所示。然而，对于较大对象而言，这通常是不理想的，并且无法处理一对多关系。

在复杂对象或一对多关系的情况下，用户可以使用：

- 命名元组 - 这些允许将相关结构表示为一组列。
- Array(Tuple) 或 Nested - 嵌套的命名元组数组，每个条目代表一个对象。适用于一对多关系。

作为示例，我们在下面演示将 `PostLinks` 反规范化到 `Posts`。

每个帖子可以包含多个链接到其他帖子的链接，如前面的 `PostLinks` 模式所示。作为嵌套类型，我们可能将这些链接和重复帖子表示如下：

```sql
SET flatten_nested=0
CREATE TABLE posts_with_links
(
  `Id` Int32 CODEC(Delta(4), ZSTD(1)),
   ... -其他列
   `LinkedPosts` Nested(CreationDate DateTime64(3, 'UTC'), PostId Int32),
   `DuplicatePosts` Nested(CreationDate DateTime64(3, 'UTC'), PostId Int32),
) ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
```

> 注意使用的设置 `flatten_nested=0`。我们建议禁用嵌套数据的扁平化。

我们可以使用 `INSERT INTO SELECT` 通过带有 `OUTER JOIN` 的查询来执行此反规范化：

```sql
INSERT INTO posts_with_links
SELECT
    posts.*,
    arrayMap(p -> (p.1, p.2), arrayFilter(p -> p.3 = 'Linked' AND p.2 != 0, Related)) AS LinkedPosts,
    arrayMap(p -> (p.1, p.2), arrayFilter(p -> p.3 = 'Duplicate' AND p.2 != 0, Related)) AS DuplicatePosts
FROM posts
LEFT JOIN (
    SELECT
   	 PostId,
   	 groupArray((CreationDate, RelatedPostId, LinkTypeId)) AS Related
    FROM postlinks
    GROUP BY PostId
) AS postlinks ON posts.Id = postlinks.PostId

0 rows in set. Elapsed: 155.372 sec. Processed 66.37 million rows, 76.33 GB (427.18 thousand rows/s., 491.25 MB/s.)
Peak memory usage: 6.98 GiB.
```

> 注意这里的时间。我们成功在大约 2 分钟内反规范化了 6600 万行。正如我们稍后所看到的，这是一项可以调度的操作。

注意使用 `groupArray` 函数将 `PostLinks` 压缩为每个 `PostId` 的数组，然后在加入之前过滤出两个子列表：`LinkedPosts` 和 `DuplicatePosts`，也排除了外部连接中的任何空结果。

我们可以选择一些行来查看我们新的反规范化结构：

```sql
SELECT LinkedPosts, DuplicatePosts
FROM posts_with_links
WHERE (length(LinkedPosts) > 2) AND (length(DuplicatePosts) > 0)
LIMIT 1
FORMAT Vertical

Row 1:
──────
LinkedPosts:	[('2017-04-11 11:53:09.583',3404508),('2017-04-11 11:49:07.680',3922739),('2017-04-11 11:48:33.353',33058004)]
DuplicatePosts: [('2017-04-11 12:18:37.260',3922739),('2017-04-11 12:18:37.260',33058004)]
```

## 组织和调度反规范化 {#orchestrating-and-scheduling-denormalization}

### 批处理 {#batch}

利用反规范化需要一个转换过程，以便可以执行和调度。

我们已展示如何在数据通过 `INSERT INTO SELECT` 加载后，ClickHouse 可用于执行该转换。这适合于定期的批处理转换。

用户在 ClickHouse 中有几种选择来组织这一过程，假设定期的批量加载过程是可以接受的：

- **[可刷新物化视图](/materialized-view/refreshable-materialized-view)** - 可刷新物化视图可以用于定期调度查询，并将结果发送到目标表。在查询执行时，视图确保目标表被原子更新。这提供了 ClickHouse 原生的调度工作方式。
- **外部工具** - 使用诸如 [dbt](https://www.getdbt.com/) 和 [Airflow](https://airflow.apache.org/) 的工具定期调度变换。 [ClickHouse 与 dbt 的集成](/integrations/dbt) 确保这是以原子方式执行的，创建目标表的新版本，然后与接收查询的版本原子交换（通过 [EXCHANGE](/sql-reference/statements/exchange) 命令）。

### 流处理 {#streaming}

用户也可以希望在 ClickHouse 之外执行此操作，在插入之前使用流处理技术，如 [Apache Flink](https://flink.apache.org/)。或者，可以使用增量 [物化视图](/guides/developer/cascading-materialized-views) 在数据插入时执行此过程。
