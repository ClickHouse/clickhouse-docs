---
slug: /data-modeling/denormalization
title: '数据反规范化'
description: '如何使用反规范化提升查询性能'
keywords: ['数据反规范化', '反规范化', '查询优化']
doc_type: 'guide'
---

import denormalizationDiagram from '@site/static/images/data-modeling/denormalization-diagram.png';
import denormalizationSchema from '@site/static/images/data-modeling/denormalization-schema.png';
import Image from '@theme/IdealImage';


# 数据反规范化 {#denormalizing-data}

在 ClickHouse 中，数据反规范化是一种通过使用扁平表并避免 `JOIN` 来最大限度降低查询延迟的技术。

## 比较规范化与反规范化模式 {#comparing-normalized-vs-denormalized-schemas}

对数据进行反规范化，是指有意地逆转规范化过程，以针对特定查询模式优化数据库性能。在规范化数据库中，数据被拆分到多个关联表中，以最小化冗余并确保数据完整性。反规范化通过合并表、复制数据，以及将计算字段并入单个或更少数量的表中来重新引入冗余——实质上是把原本在查询时执行的 `JOIN` 操作前移到写入（插入）阶段完成。

这一过程减少了查询时对复杂 `JOIN` 的需求，并可显著加快读取操作，使其非常适合读负载较重且查询较为复杂的应用。不过，这也会增加写入操作和运维的复杂度，因为对任何被复制数据的变更都必须在所有存储该数据的记录之间传播，以保持一致性。

<Image img={denormalizationDiagram} size="lg" alt="ClickHouse 中的反规范化"/>

<br />

一种由 NoSQL 方案推广的常见技术，是在缺乏 `JOIN` 支持的情况下对数据进行反规范化，将所有统计信息或相关行作为列和嵌套对象存储在父行上。例如，在博客的示例模式中，我们可以将所有 `Comments` 作为对象的 `Array` 存储在各自对应的帖子记录中。

## 何时使用反规范化 {#when-to-use-denormalization}

通常情况下，我们建议在以下情形下进行反规范化：

- 对于变化不频繁，或者可以容忍数据在可用于分析查询前存在一定延迟（即可以通过批处理完全重载数据）的表进行反规范化。
- 避免对多对多关系进行反规范化。这可能会导致当单个源行发生变化时，需要更新大量行。
- 避免对高基数关系进行反规范化。如果一个表中的每一行在另一张表中有成千上万条关联记录，则这些关系需要通过 `Array` 来表示——要么是原始类型数组，要么是元组数组。一般来说，不建议数组中包含超过 1000 个元组。
- 与其将所有列都反规范化为嵌套对象，不如考虑仅使用物化视图（见下文）来反规范化某个统计值。

并非所有信息都需要反规范化——只需对那些需要被频繁访问的关键信息进行反规范化即可。

反规范化工作可以在 ClickHouse 中完成，也可以在上游系统中完成，例如使用 Apache Flink。

## 避免对频繁更新的数据进行反规范化 {#avoid-denormalization-on-frequently-updated-data}

对于 ClickHouse，反规范化是用户可用于优化查询性能的多种手段之一，但应谨慎使用。如果数据被频繁更新，并且需要接近实时地完成更新，就应避免采用这种方法。仅当主表基本上是追加写入（append-only），或者可以按批次（例如每日）周期性重新加载时，才建议使用这种方式。

在实践中，这种做法面临的首要挑战是写入性能和数据更新。更具体地说，反规范化实际上将数据 `JOIN` 的责任从查询时转移到了摄取时。虽然这可以显著提升查询性能，但会使摄取过程更加复杂，并意味着如果用于构建某一行的任一源行发生变化，数据管道就需要在 ClickHouse 中重新插入这一行。这可能导致：一个源行的变更意味着 ClickHouse 中的多行需要更新。在复杂的 schema 中，如果行是通过复杂的 `JOIN` 组合而成，那么 `JOIN` 中某个嵌套组件的一行发生改变，都可能导致需要更新数百万行。

在实时场景下实现这一点通常不现实，并且由于以下两个挑战会需要大量工程投入：

1. 在表行发生变化时触发正确的 `JOIN` 语句。理想情况下，这不应导致该 `JOIN` 涉及的所有对象都被更新，而只更新受影响的那些。要在高吞吐量下高效地调整 `JOIN` 来筛选出正确的行，往往需要额外的外部工具或工程实现。
1. 在 ClickHouse 中对行进行更新需要精细管理，从而引入额外复杂性。

<br />

因此，更常见的做法是采用批量更新流程，定期重新加载所有反规范化后的对象。

## 反规范化的实践案例 {#practical-cases-for-denormalization}

我们来看看几个适合进行反规范化的实际示例，以及一些更适合采用其他方法的情形。

假设有一个已经通过 `AnswerCount` 和 `CommentCount` 等统计信息完成反规范化的 `Posts` 表——源数据就是以这种形式提供的。实际上，我们可能希望将这些信息重新进行规范化，因为它们很可能会被频繁修改。这些列中的许多信息也可以通过其他表获得，例如某个帖子的评论可以通过 `PostId` 列和 `Comments` 表获取。出于示例说明的目的，我们假设帖子是通过批处理过程重新加载的。

我们同样只考虑将其他表反规范化到 `Posts` 上，因为我们将其视为分析的主表。反方向进行反规范化对于某些查询同样是合适的，并且适用于上述相同的考量。

*在以下每个示例中，都假设存在一个查询，需要在联接操作中同时使用这两个表。*

### Posts 与 Votes {#posts-and-votes}

帖子上的投票使用单独的表来表示。下面展示的是针对这一场景优化后的模式，以及用于加载数据的插入命令：

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

乍一看，这些看起来似乎可以作为在 posts 表上进行反规范化处理的候选对象。不过，这种做法也存在一些挑战。

帖子会频繁收到投票。尽管随着时间推移，每个帖子的投票频率可能会下降，但下面这条查询显示，在 3 万多篇帖子上，我们每小时大约会产生 4 万次投票。

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

如果可以容忍一定的延迟，可以通过批处理来缓解这个问题，但除非我们定期重新加载所有帖子（这通常并不是理想的做法），否则仍然需要处理更新。

更麻烦的是，有些帖子获得的投票数极其之多：

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

这里的关键点是：对于大多数分析场景来说，每条帖子只需要聚合后的投票统计信息就足够了——我们不需要对所有投票信息进行反规范化。比如，当前的 `Score` 列就代表了这种统计信息，即赞成票总数减去反对票总数。理想情况下，我们只需在查询时通过一次简单查找就能获取这些统计数据（参见 [dictionaries](/dictionary)）。


### Users 和 Badges {#users-and-badges}

现在我们来看看 `Users` 和 `Badges`：

<Image img={denormalizationSchema} size="lg" alt="Users and Badges schema" />

<p />

首先，我们使用以下命令插入数据：

<p />

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

虽然用户可能频繁获得徽章，但这不太可能是一个需要我们每天更新多次的数据集。徽章和用户之间的关系是一对多。也许我们可以简单地将徽章反规范化到用户记录中，作为一个元组列表存储？虽然可行，但对单个用户徽章数量上限的快速检查表明，这并不理想：

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

将 1.9 万个对象全部反规范化到单行上可能并不现实。这个关系最好保持为单独的表，或者通过增加统计信息来处理。

> 我们可能希望把徽章相关的统计信息反规范化到用户上，例如徽章的数量。在该数据集的插入阶段使用字典时，我们会考虑这种情况。


### Posts 和 PostLinks {#posts-and-postlinks}

`PostLinks` 用于关联用户认为相关或重复的 `Posts`。下面的查询展示了表结构和加载命令：

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

我们可以确认，没有任何帖子的链接数量多到会阻碍反规范化：

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

同样，这些链接本身也不是发生得特别频繁的事件：

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

在下文中，我们将以此作为反规范化的示例。


### 简单统计示例 {#simple-statistic-example}

在大多数情况下，反规范化只需要在父行上添加单个列或统计信息。例如，我们可能只希望为帖子补充一个表示其重复帖数量的列，此时只需添加一列即可。

```sql
CREATE TABLE posts_with_duplicate_count
(
  `Id` Int32 CODEC(Delta(4), ZSTD(1)),
   ... -other columns
   `DuplicatePosts` UInt16
) ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
```

为了向这张表写入数据，我们使用 `INSERT INTO SELECT` 语句，将重复帖统计与帖子数据进行关联。

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

为了进行反规范化，我们通常需要利用复杂类型。如果是列数较少的一对一关系，用户可以像上面所示那样，直接将这些列以其原始类型添加到主表中。不过，对于较大的对象，这往往并不理想，对一对多关系则根本不可行。

在处理复杂对象或一对多关系的场景中，用户可以使用：

* Named Tuples —— 允许将相关结构表示为一组列。
* Array(Tuple) 或 Nested —— 由命名元组（tuple）组成的数组，也称为 Nested，其中每个条目表示一个对象。适用于一对多关系。

例如，我们在下面演示如何将 `PostLinks` 反规范化到 `Posts` 上。

每个帖子都可以包含若干指向其他帖子的链接，如前面 `PostLinks` 模式中所示。作为一种 Nested 类型，我们可以如下表示这些被链接的帖子以及重复的帖子：

```sql
SET flatten_nested=0
CREATE TABLE posts_with_links
(
  `Id` Int32 CODEC(Delta(4), ZSTD(1)),
   ... -other columns
   `LinkedPosts` Nested(CreationDate DateTime64(3, 'UTC'), PostId Int32),
   `DuplicatePosts` Nested(CreationDate DateTime64(3, 'UTC'), PostId Int32),
) ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
```

> 请注意此处使用了设置 `flatten_nested=0`。我们建议禁用对嵌套数据的扁平化处理。

我们可以通过一条带有 `OUTER JOIN` 的 `INSERT INTO SELECT` 查询来完成此反规范化操作：

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

> 注意这里的耗时。我们在大约 2 分钟内对 6600 万行数据完成了反规范化处理。正如我们稍后会看到的，这是一个可以进行调度的操作。

请注意这里使用了 `groupArray` 函数，在进行关联之前，将 `PostLinks` 按每个 `PostId` 聚合成一个数组。然后再将该数组过滤成两个子列表：`LinkedPosts` 和 `DuplicatePosts`，同时还会排除外连接产生的任何空结果。

我们可以选择一些行来查看新的反规范化结构：

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

要充分利用反规范化，需要一个能够执行并编排该转换的流程。

前文已经展示了，在数据通过 `INSERT INTO SELECT` 语句加载后，如何使用 ClickHouse 来执行这一转换。这种方式适用于周期性的批处理转换。

在假设可以接受周期性批量加载流程的前提下，用户在 ClickHouse 中有多种方式来编排这一过程：

- **[可刷新materialized view](/materialized-view/refreshable-materialized-view)** - 可刷新materialized view 可以用来周期性地调度查询，并将结果写入目标表。在查询执行时，VIEW 会确保对目标表的更新是原子性的。这提供了一种 ClickHouse 原生的任务调度方式。
- **外部工具** - 使用诸如 [dbt](https://www.getdbt.com/) 和 [Airflow](https://airflow.apache.org/) 等工具，定期调度转换任务。[ClickHouse 的 dbt 集成](/integrations/dbt) 确保该过程以原子方式执行：先创建目标表的新版本，然后通过 [EXCHANGE](/sql-reference/statements/exchange) 命令，将其与当前对外提供查询服务的版本进行原子交换。

### 流式处理 {#streaming}

用户也可以选择在 ClickHouse 之外、在数据插入之前，使用诸如 [Apache Flink](https://flink.apache.org/) 等流式技术来执行这一过程。或者，也可以使用增量[物化视图](/guides/developer/cascading-materialized-views)，在数据插入时执行这一处理流程。