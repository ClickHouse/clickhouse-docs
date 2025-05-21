---
'slug': '/data-modeling/denormalization'
'title': '数据去规范化'
'description': '如何利用数据去规范化来提高查询性能'
'keywords':
- 'data denormalization'
- 'denormalize'
- 'query optimization'
---

import denormalizationDiagram from '@site/static/images/data-modeling/denormalization-diagram.png';
import denormalizationSchema from '@site/static/images/data-modeling/denormalization-schema.png';
import Image from '@theme/IdealImage';


# 去规范化数据

去规范化数据是一种在 ClickHouse 中使用扁平表的技术，通过避免连接来帮助最小化查询延迟。

## 比较规范化与去规范化模式 {#comparing-normalized-vs-denormalized-schemas}

去规范化数据涉及故意逆转规范化过程，以优化数据库性能以适应特定的查询模式。在规范化数据库中，数据被拆分成多个相关表，以最小化冗余并确保数据完整性。去规范化通过合并表、重复数据以及将计算字段合并到一个表或更少的表中，重新引入冗余——有效地将所有连接从查询时间转移到插入时间。

这个过程减少了在查询时间进行复杂连接的需要，并且可以显著加快读操作，使其非常适合重读需求高和查询复杂的应用程序。然而，它可能会增加写操作和维护的复杂性，因为对重复数据的任何更改必须传播到所有实例以保持一致性。

<Image img={denormalizationDiagram} size="lg" alt="ClickHouse中的去规范化"/>

<br />

一种由 NoSQL 解决方案普及的常见技术是在缺少 `JOIN` 支持的情况下去规范化数据，有效地将所有统计数据或相关行作为列和嵌套对象存储在父行上。例如，在一个博客的示例模式中，我们可以将所有 `Comments` 存储为它们各自文章的对象数组。

## 何时使用去规范化 {#when-to-use-denormalization}

一般而言，我们建议在以下情况下进行去规范化：

- 去规范化那些变化不频繁的表，或者可以容忍在数据可用于分析查询前延迟，即数据可以完全重新加载为批处理的情况。
- 避免去规范化多对多关系。如果单个源行更改，可能会导致需要更新许多行。
- 避免去规范化高基数关系。如果表中的每一行在另一表中有成千上万的相关条目，则这些条目需要被表示为一个 `Array`——无论是原始类型还是元组。一般而言，不建议使用超过 1000 个元组的数组。
- 而不是将所有列作为嵌套对象去规范化，考虑仅使用物化视图去规范化一个统计数据（见下文）。

并不是所有的信息都需要去规范化——只需要去规范化那些频繁访问的关键信息。

去规范化工作可以在 ClickHouse 中处理，或在上游处理，例如使用 Apache Flink。

## 避免对频繁更新的数据去规范化 {#avoid-denormalization-on-frequently-updated-data}

对于 ClickHouse，去规范化是用户可以用来优化查询性能的多种选项之一，但应该谨慎使用。如果数据频繁更新并且需要近实时更新，则应避免此方法。如果主表主要是仅追加的或可以定期作为批量重新加载，例如每天更新，则可以使用此方法。

作为一种方法，它面临一个主要挑战-写性能和数据更新。更具体地说，去规范化有效地将数据连接的责任从查询时间转移到摄取时间。虽然这可以显著提高查询性能，但会使摄取变得复杂，并且意味着数据管道需要在 ClickHouse 中重新插入行，如果构成其的任何行发生更改。这可能意味着源行的一个更改可能意味着 ClickHouse 中需要更新许多行。在复杂模式中，行是由复杂连接组成的，连接的嵌套组件中的单个行更改可能意味着需要更新数百万行。

在实时实现这个目标通常是不现实的，并且需要大量的工程投入，原因有两个挑战：

1. 当表行发生更改时，触发正确的连接语句。这理想情况下不应该导致连接的所有对象都被更新——而只是那些受影响的对象。修改连接以有效过滤正确的行，并在高吞吐量下实现这一点，需要外部工具或工程支持。
2. ClickHouse 中的行更新需要仔细管理，增加了额外的复杂性。

<br />

因此，批量更新过程更加常见，所有去规范化的对象定期重新加载。

## 去规范化的实际案例 {#practical-cases-for-denormalization}

让我们考虑几个实际示例，在这些示例中去规范化可能是合理的，而其他地方替代方法更佳。

考虑一个已去规范化的 `Posts` 表，具有如 `AnswerCount` 和 `CommentCount` 等统计数据 - 来源数据就是这种形式。实际上，我们可能想要将这些信息实际规范化，因为它们可能会频繁更改。这些列中的许多也可以通过其他表提供，例如，文章的评论可以通过 `PostId` 列和 `Comments` 表获取。为了举例说明，我们假设文章是通过批处理流程重新加载的。

我们还仅考虑将其他表去规范化到 `Posts` 上，因为我们视其为分析的主要表。去规范化到另一个方向的情况对于某些查询也是适当的，相同的考虑适用。

*对于以下示例，假设存在需要同时使用这两张表的查询。*

### 文章与投票 {#posts-and-votes}

文章的投票以单独的表表示。下面显示了优化后的模式以及加载数据的插入命令：

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

乍一看，这可能是去规范化到文章表上的候选项。然而，这种方法面临一些挑战。

投票经常被添加到文章中。虽然随时间的推移每篇文章的投票可能减少，但以下查询显示我们每小时约有 40k 的投票分布在 30k 文章上。

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

如果可以容忍延迟，这可以通过批量处理来解决，但这仍然要求我们处理更新，除非我们定期重新加载所有文章（不太可能是可取的）。

更麻烦的是，有些文章的投票数量极其庞大：

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

这里的主要观察是，对于大多数分析而言，聚合的投票统计数据对于每篇文章都足够——我们不需要去规范化所有投票信息。例如，当前的 `Score` 列就表示这种统计，即总的上投票数减去下投票数。理想情况下，我们可以在查询时间用简单的查找来检索这些统计数据（见 [dictionaries](/dictionary)）。

### 用户与徽章 {#users-and-badges}

现在让我们考虑我们的 `Users` 和 `Badges`：

<Image img={denormalizationSchema} size="lg" alt="Users and Badges schema"/>

<p></p>
我们首先用以下命令插入数据：
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

虽然用户可能频繁获得徽章，但这不太可能是我们需要每天更新多次的数据集。徽章与用户之间的关系是多对一的。也许我们可以简单地将徽章去规范化到用户，如元组列表？虽然可以，但快速检查确认每个用户的最多徽章数表明这并不理想：

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

将 19k 个对象去规范化到单行上大概是不现实的。这种关系最好保持为单独的表或添加统计信息。

> 我们可能希望将徽章的统计信息去规范化到用户上，例如徽章数量。我们考虑在插入时使用字典的这种情况。

### 文章与 PostLinks {#posts-and-postlinks}

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

我们可以确认没有文章有过多的链接，阻碍去规范化：

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

同样，这些链接并不是过于频繁发生的事件：

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

我们将在下面用这个作为去规范化的示例。

### 简单统计示例 {#simple-statistic-example}

在大多数情况下，去规范化要求在父行上添加一个单独的列或统计信息。例如，我们可能只希望通过添加一列来增强我们的文章，显示重复文章的数量。

```sql
CREATE TABLE posts_with_duplicate_count
(
  `Id` Int32 CODEC(Delta(4), ZSTD(1)),
   ... -other columns
   `DuplicatePosts` UInt16
) ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
```

要填充这个表，我们利用 `INSERT INTO SELECT` 将我们的重复统计与我们的文章连接。

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

为了执行去规范化，我们通常需要利用复杂的类型。如果是一对一的关系去规范化，列数较少，用户可以简单地将这些作为行添加，与上述原始类型相同。然而，对于更大的对象，这通常是不可取的，并且不能应用于一对多的关系。

在复杂对象或一对多关系的情况下，用户可以使用：

- 命名元组 - 这些允许将一个相关结构表示为一组列。
- Array(Tuple) 或 Nested - 一个命名元组的数组，也称为嵌套，每个条目表示一个对象。适用于一对多关系。

作为示例，我们在下面演示将 `PostLinks` 去规范化到 `Posts` 上。

每篇文章可以包含多个链接到其他文章，如前面`PostLinks` 的模式所示。作为嵌套类型，我们可以将这些链接和重复的文章表示如下：

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

> 注意使用的设置 `flatten_nested=0`。我们建议禁用嵌套数据的扁平化。

我们可以使用 `INSERT INTO SELECT` 和 `OUTER JOIN` 查询来执行这种去规范化：

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

> 注意到时间点。我们成功地在大约 2 分钟内去规范化了 6600 万行。正如我们稍后将看到的，这是一个我们可以安排的操作。

注意使用 `groupArray` 函数将 `PostLinks` 压缩为每个 `PostId` 的数组，之后再进行连接。然后将此数组过滤成两个子列表：`LinkedPosts` 和 `DuplicatePosts`，同时排除外连接中任何空结果。

我们可以选择一些行以查看我们的新去规范化结构：

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

## 组织和调度去规范化 {#orchestrating-and-scheduling-denormalization}

### 批处理 {#batch}

利用去规范化需要一个转换过程，可以在其中执行和组织。

我们在上面展示了如何使用 ClickHouse 来执行此转换，一旦数据通过 `INSERT INTO SELECT` 加载。这适用于定期批量转换。

用户在 ClickHouse 中组织这个过程的选项有几个，假设定期批量加载过程是可接受的：

- **[可刷新物化视图](/materialized-view/refreshable-materialized-view)** - 可刷新的物化视图可用于定期调度查询，并将结果发送到目标表。在查询执行时，视图确保目标表原子更新。这提供了一种 ClickHouse 原生手段来调度这项工作。
- **外部工具** - 利用诸如 [dbt](https://www.getdbt.com/) 和 [Airflow](https://airflow.apache.org/) 等工具，定期调度转换。[ClickHouse与dbt的集成](/integrations/dbt) 确保该操作以原子方式执行，并创建新版本的目标表，然后以原子方式替换接收查询的版本（通过 [EXCHANGE](/sql-reference/statements/exchange) 命令）。

### 流式处理 {#streaming}

用户还可以在 ClickHouse 之外、插入之前使用流技术执行此操作，例如 [Apache Flink](https://flink.apache.org/)。或者，增量 [物化视图](/guides/developer/cascading-materialized-views) 可用于在数据插入时执行此过程。
