---
slug: /data-modeling/denormalization
title: '数据反规范化'
description: '如何通过反规范化提升查询性能'
keywords: ['data denormalization', 'denormalize', 'query optimization']
doc_type: 'guide'
---

import denormalizationDiagram from '@site/static/images/data-modeling/denormalization-diagram.png';
import denormalizationSchema from '@site/static/images/data-modeling/denormalization-schema.png';
import Image from '@theme/IdealImage';


# 数据反规范化

在 ClickHouse 中，数据反规范化是一种通过使用扁平表来尽量避免执行 JOIN，从而降低查询延迟的技术。



## 规范化与反规范化模式对比 {#comparing-normalized-vs-denormalized-schemas}

数据反规范化是指有意地逆转规范化过程,以针对特定查询模式优化数据库性能。在规范化数据库中,数据被拆分到多个相关表中,以最小化冗余并确保数据完整性。反规范化通过合并表、复制数据以及将计算字段整合到单个表或更少的表中来重新引入冗余——实际上是将连接操作从查询时移至插入时。

这一过程减少了查询时对复杂连接的需求,并能显著加快读取操作速度,使其非常适合具有大量读取需求和复杂查询的应用场景。然而,它可能会增加写入操作和维护的复杂性,因为对重复数据的任何更改都必须传播到所有实例以保持一致性。

<Image
  img={denormalizationDiagram}
  size='lg'
  alt='ClickHouse 中的反规范化'
/>

<br />

NoSQL 解决方案推广的一种常见技术是在缺乏 `JOIN` 支持的情况下对数据进行反规范化,有效地将所有统计信息或相关行作为列和嵌套对象存储在父行上。例如,在博客的示例模式中,我们可以将所有 `Comments` 作为对象数组(`Array`)存储在各自的帖子上。


## 何时使用反规范化 {#when-to-use-denormalization}

通常情况下,我们建议在以下场景中使用反规范化:

- 对变更不频繁的表进行反规范化,或者可以容忍数据在分析查询中可用之前存在延迟的表,即数据可以通过批处理方式完全重新加载。
- 避免对多对多关系进行反规范化。这可能导致单个源行发生变更时需要更新大量行。
- 避免对高基数关系进行反规范化。如果表中的每一行在另一个表中有数千个相关条目,这些条目需要表示为 `Array` 类型——可以是基本类型或元组。通常不建议使用包含超过 1000 个元组的数组。
- 与其将所有列作为嵌套对象进行反规范化,不如考虑仅使用物化视图对统计信息进行反规范化(见下文)。

并非所有信息都需要反规范化——只需反规范化需要频繁访问的关键信息即可。

反规范化工作可以在 ClickHouse 中处理,也可以在上游处理,例如使用 Apache Flink。


## 避免对频繁更新的数据进行反规范化 {#avoid-denormalization-on-frequently-updated-data}

对于 ClickHouse 而言,反规范化是用户优化查询性能的几种可选方案之一,但应谨慎使用。如果数据更新频繁且需要近实时更新,则应避免采用此方法。该方法适用于主表以追加为主或可定期批量重新加载(例如每日加载)的场景。

作为一种方案,它面临一个主要挑战——写入性能和数据更新。更具体地说,反规范化实际上将数据关联的责任从查询时转移到了数据摄取时。虽然这可以显著提升查询性能,但会使数据摄取变得复杂,并且意味着一旦用于组成某行的任何源行发生变化,数据管道就需要将该行重新插入 ClickHouse。这可能导致源表中一行的更改需要更新 ClickHouse 中的多行数据。在复杂的模式中,如果行是由复杂关联组成的,关联中嵌套组件的单行更改可能意味着需要更新数百万行。

由于以下两个挑战,实时实现这一点往往不切实际,并且需要大量的工程投入:

1. 当表行发生变化时触发正确的关联语句。理想情况下,这不应导致关联的所有对象都被更新——而只更新那些受到影响的对象。要高效地修改关联以过滤到正确的行,并在高吞吐量下实现这一点,需要外部工具或工程支持。
1. ClickHouse 中的行更新需要仔细管理,这会引入额外的复杂性。

<br />

因此,批量更新过程更为常见,即定期重新加载所有反规范化对象。


## 反规范化的实际案例 {#practical-cases-for-denormalization}

让我们看几个反规范化可能有意义的实际示例，以及一些更适合采用替代方法的情况。

考虑一个已经包含统计信息（如 `AnswerCount` 和 `CommentCount`）的反规范化 `Posts` 表——源数据就是以这种形式提供的。实际上，我们可能希望将这些信息规范化，因为它们很可能会频繁变化。这些列中的许多信息也可以通过其他表获得,例如帖子的评论可以通过 `PostId` 列和 `Comments` 表获得。在本示例中，我们假设帖子通过批处理过程重新加载。

我们也只考虑将其他表反规范化到 `Posts` 上，因为我们将其视为分析的主表。对于某些查询，反向反规范化也是合适的，同样需要考虑上述因素。

_对于以下每个示例，假设存在一个需要连接两个表的查询。_

### Posts 和 Votes {#posts-and-votes}

帖子的投票表示为单独的表。下面显示了优化后的表结构以及加载数据的插入命令:

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

乍一看，这些可能是在帖子表上进行反规范化的候选项。但这种方法存在一些挑战。

投票会频繁添加到帖子中。虽然随着时间的推移，每个帖子的投票可能会减少，但以下查询显示我们每小时在 30k 个帖子上有大约 40k 次投票。

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
│               41759 │         33322 │
└──────────────────┴──────────────────┘
```

如果可以容忍延迟，这可以通过批处理来解决，但这仍然需要我们处理更新，除非定期重新加载所有帖子（这不太理想）。

更麻烦的是，某些帖子的投票数极高:

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

这里的主要观察结果是，每个帖子的聚合投票统计信息对于大多数分析来说已经足够——我们不需要反规范化所有投票信息。例如，当前的 `Score` 列就表示这样的统计信息，即总赞成票减去反对票。理想情况下，我们只需在查询时通过简单的查找来检索这些统计信息（参见[字典](/dictionary)）。

### Users 和 Badges {#users-and-badges}

现在让我们看看 `Users` 和 `Badges`:

<Image img={denormalizationSchema} size='lg' alt='Users and Badges schema' />

<p></p>
我们首先使用以下命令插入数据:
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

虽然用户可能会频繁获得徽章,但这个数据集不太可能需要每天更新多次。徽章和用户之间是一对多的关系。也许我们可以简单地将徽章作为元组列表反规范化到用户表上?虽然可行,但快速检查每个用户的最高徽章数量后发现这并不理想:

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

将 19,000 个对象反规范化到单行显然不太现实。这种关系最好保留为独立的表,或者添加统计信息。

> 我们可能希望将徽章的统计信息反规范化到用户表上,例如徽章数量。在插入时使用字典处理此数据集时,我们会考虑这样的示例。

### 帖子和帖子链接 {#posts-and-postlinks}

`PostLinks` 连接用户认为相关或重复的 `Posts`。以下查询展示了表结构和加载命令:

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

我们可以确认没有帖子具有过多的链接导致无法进行反规范化:

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

同样,这些链接也不是过于频繁发生的事件:


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
│                54 │                    44     │
└──────────────────┴──────────────────┘
```

我们在下面的反范式化示例中使用此查询。

### 简单统计示例 {#simple-statistic-example}

在大多数情况下,反范式化需要向父行添加单个列或统计信息。例如,我们可能只是希望用重复帖子的数量来丰富帖子数据,只需添加一个列即可。

```sql
CREATE TABLE posts_with_duplicate_count
(
  `Id` Int32 CODEC(Delta(4), ZSTD(1)),
   ... -其他列
   `DuplicatePosts` UInt16
) ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
```

为了填充此表,我们使用 `INSERT INTO SELECT` 将重复统计信息与帖子数据进行关联。

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

为了执行反范式化,我们通常需要利用复杂类型。如果要反范式化一对一关系,且列数较少,用户可以简单地将这些列以其原始类型添加,如上所示。然而,对于较大的对象,这通常不太理想,而且对于一对多关系也不可行。

在处理复杂对象或一对多关系的情况下,用户可以使用:

- 命名元组(Named Tuples) - 允许将相关结构表示为一组列。
- Array(Tuple) 或 Nested - 命名元组的数组,也称为 Nested,每个条目代表一个对象。适用于一对多关系。

作为示例,我们在下面演示将 `PostLinks` 反范式化到 `Posts` 上。

每个帖子可以包含多个指向其他帖子的链接,如前面 `PostLinks` 模式所示。作为 Nested 类型,我们可以按如下方式表示这些链接帖子和重复帖子:

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

> 注意使用设置 `flatten_nested=0`。我们建议禁用嵌套数据的扁平化。

我们可以使用带有 `OUTER JOIN` 查询的 `INSERT INTO SELECT` 来执行此反范式化:

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

返回 0 行。耗时:155.372 秒。处理了 6637 万行,76.33 GB(每秒 42.718 万行,491.25 MB/秒)。
峰值内存使用:6.98 GiB。
```

> 注意这里的时间。我们在大约 2 分钟内成功反范式化了 6600 万行。正如我们稍后将看到的,这是一个可以调度的操作。


请注意这里使用了 `groupArray` 函数，在进行 `join` 之前，将 `PostLinks` 聚合为按每个 `PostId` 分组的数组。然后再将该数组过滤成两个子列表：`LinkedPosts` 和 `DuplicatePosts`，同时还会排除外连接产生的任何空结果。

我们可以选取部分行来查看新的反规范化结构：

```sql
SELECT LinkedPosts, DuplicatePosts
FROM posts_with_links
WHERE (length(LinkedPosts) > 2) AND (length(DuplicatePosts) > 0)
LIMIT 1
FORMAT Vertical

Row 1:
──────
LinkedPosts:    [('2017-04-11 11:53:09.583',3404508),('2017-04-11 11:49:07.680',3922739),('2017-04-11 11:48:33.353',33058004)]
DuplicatePosts: [('2017-04-11 12:18:37.260',3922739),('2017-04-11 12:18:37.260',33058004)]
```


## 编排和调度反规范化 {#orchestrating-and-scheduling-denormalization}

### 批处理 {#batch}

利用反规范化需要一个可执行和编排的转换过程。

我们在上文展示了如何在通过 `INSERT INTO SELECT` 加载数据后,使用 ClickHouse 执行此转换。这适用于周期性批量转换。

假设周期性批量加载过程可以满足需求,用户在 ClickHouse 中有多种编排选项:

- **[可刷新物化视图](/materialized-view/refreshable-materialized-view)** - 可刷新物化视图可用于周期性调度查询,并将结果发送到目标表。在查询执行时,视图确保目标表以原子方式更新。这提供了 ClickHouse 原生的工作调度方式。
- **外部工具** - 利用 [dbt](https://www.getdbt.com/) 和 [Airflow](https://airflow.apache.org/) 等工具周期性调度转换。[ClickHouse 的 dbt 集成](/integrations/dbt)确保此操作以原子方式执行,先创建目标表的新版本,然后与接收查询的版本进行原子交换(通过 [EXCHANGE](/sql-reference/statements/exchange) 命令)。

### 流式处理 {#streaming}

用户也可以选择在插入之前,使用流式处理技术(如 [Apache Flink](https://flink.apache.org/))在 ClickHouse 外部执行此操作。或者,可以使用增量[物化视图](/guides/developer/cascading-materialized-views)在数据插入时执行此过程。
