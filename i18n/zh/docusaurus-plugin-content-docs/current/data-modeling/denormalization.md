---
'slug': '/data-modeling/denormalization'
'title': '去规范化数据'
'description': '如何使用去规范化来提高 Query 性能'
'keywords':
- 'data denormalization'
- 'denormalize'
- 'query optimization'
---

import denormalizationDiagram from '@site/static/images/data-modeling/denormalization-diagram.png';
import denormalizationSchema from '@site/static/images/data-modeling/denormalization-schema.png';
import Image from '@theme/IdealImage';


# 数据非规范化

数据非规范化是 ClickHouse 中的一种技术，利用扁平化表格帮助最小化查询延迟，从而避免连接操作。

## 比较规范化与非规范化模式 {#comparing-normalized-vs-denormalized-schemas}

数据非规范化涉及故意逆转规范化过程，以优化数据库在特定查询模式下的性能。在规范化数据库中，数据分为多个相关表，以最小化冗余并确保数据完整性。非规范化通过合并表格、复制数据和将计算字段合并到一个或更少的表中重新引入冗余 - 有效地将任何连接操作从查询时间移至插入时间。

此过程减少了在查询时对复杂连接的需求，并且可以显著加快读取操作，使其非常适合具有重读需求和复杂查询的应用程序。然而，这可能会增加写入操作和维护的复杂性，因为对复制数据的任何更改必须在所有实例之间传播以保持一致性。

<Image img={denormalizationDiagram} size="lg" alt="ClickHouse中的非规范化"/>

<br />

一种被 NoSQL 解决方案推广的常见技术是在没有 `JOIN` 支持的情况下进行数据非规范化，有效地将所有统计信息或相关行存储在父行的列和嵌套对象中。例如，在一个博客的示例模式中，我们可以将所有 `Comments` 存储为其各自帖子的对象数组。

## 何时使用非规范化 {#when-to-use-denormalization}

一般来说，我们推荐在以下情况下进行非规范化：

- 非规范化那些变化不频繁的表，或者可以容忍数据在分析查询前延迟可用的情况，即数据可以在一个批次中完全重新加载。
- 避免对多对多关系进行非规范化。如果一个源行发生变化，可能会导致需要更新多个行。
- 避免对高基数关系进行非规范化。如果表中的每一行在另一个表中有数千个相关条目，则需要将其表示为一个 `Array` - 要么是原始类型，要么是元组。一般来说，不推荐有超过1000个元组的数组。
- 与其将所有列作为嵌套对象进行非规范化，可以考虑仅使用物化视图对统计数据进行非规范化（见下文）。

并非所有的信息都需要非规范化 - 只需经常访问的关键信息即可。

非规范化的工作可以在 ClickHouse 或上游处理，例如使用 Apache Flink。

## 避免对频繁更新的数据进行非规范化 {#avoid-denormalization-on-frequently-updated-data}

对于 ClickHouse，非规范化是用户可以用来优化查询性能的几种选项之一，但应谨慎使用。如果数据更新频繁并需要接近实时更新，则应避免使用此方法。如果主表大多是仅追加的，或者可以定期批量重新加载（例如每天），则可以使用。

作为一种方法，它面临一个主要的挑战 - 写入性能和更新数据。更具体地说，非规范化有效地将数据连接的责任从查询时间转移到摄取时间。虽然这可以显著提高查询性能，但它使摄取过程变得复杂，这意味着如果用于组成它的任何行发生更改，数据管道需要在 ClickHouse 中重新插入一行。这可能意味着一个源行的更改可能需要在 ClickHouse 中更新许多行。在复杂的模式中，当行是由复杂的连接组成时，连接中的嵌套组件中的单一行更改可能意味着需要更新数百万行。

实时实现这一点通常是不切实际的，并且由于以下两个挑战而需要大量工程：

1. 当表行发生更改时，触发正确的连接语句。理想情况下，这不应导致连接的所有对象都被更新，而仅为受到影响的对象。有效地修改连接以过滤到正确的行，并在高吞吐量下实现这一点，需要外部工具或工程。
2. ClickHouse 中的行更新需要小心管理，使其复杂性增加。

<br />

因此，批量更新过程更为常见，其中所有的非规范化对象会定期重新加载。

## 非规范化的实际案例 {#practical-cases-for-denormalization}

让我们考虑一些实际示例，在这些示例中，非规范化可能是合适的，而其他情况下则更希望采用替代方法。

考虑一个已经用统计信息（如 `AnswerCount` 和 `CommentCount`）进行了非规范化的 `Posts` 表 - 源数据以这种形式提供。实际上，我们可能希望规范化这些信息，因为它很可能会频繁变化。许多这些列也可以通过其他表访问，例如可以通过 `PostId` 列和 `Comments` 表获取帖子的评论。为了方便示例，我们假设帖子是通过批处理过程重新加载的。

我们还只考虑将其他表非规范化到 `Posts` 上，因为我们认为这是我们分析的主表。朝相反方向非规范化对于某些查询此时也是合适的，应用上述相同的考虑。

*对于以下每个示例，假设存在一个需要在连接中使用两个表的查询。*

### 帖子和投票 {#posts-and-votes}

帖子投票被表示为单独的表。优化的模式如下所示，以及加载数据的插入命令：

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

乍一看，这些可能是非规范化在帖子表上的候选对象。这种方法有几个挑战。

投票经常被添加到帖子中。虽然这可能会随着时间的推移而在每个帖子上减少，但以下查询显示我们在 30k 帖子上每小时有大约 40k 次投票。

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

如果可以容忍延迟，可以通过批量处理来解决此问题，但这仍要求我们处理更新，除非我们定期重新加载所有帖子（这不太可能是可取的）。

更麻烦的是，有些帖子有极高数量的投票：

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

这里的主要观察是，对于大多数分析，聚合的每个帖子的投票统计信息就足够了 - 我们不需要对所有投票信息进行非规范化。例如，当前的 `Score` 列表示这样的统计信息，即总上票数减去下票数。理想情况下，我们希望能够在查询时通过简单查找来检索这些统计信息（见 [字典](/dictionary)）。

### 用户和徽章 {#users-and-badges}

现在让我们考虑我们的 `Users` 和 `Badges`：

<Image img={denormalizationSchema} size="lg" alt="用户和徽章模式"/>

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

虽然用户可能会频繁获得徽章，但这不太可能是我们需要每天更新的数据集。徽章和用户之间的关系是一对多关系。也许我们可以简单地将徽章作为元组列表非规范化到用户上？虽然可行，但快速检查每个用户的最大徽章数量表明这并不理想：

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

将 19k 对象非规范化到单行上可能不现实。这个关系最好保持为单独的表或者添加统计信息。

> 我们可能希望将徽章的统计信息非规范化到用户上，例如徽章的数量。当在插入时使用字典处理该数据集时，我们考虑了这样的示例。

### 帖子和帖子链接 {#posts-and-postlinks}

`PostLinks` 连接用户认为相关或重复的 `Posts`。以下查询显示模式和加载命令：

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

我们可以确认，没有帖子具有过多链接而阻止非规范化：

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

同样，这些链接并不是频繁发生的事件：

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

我们将其用作下面的非规范化示例。

### 简单统计示例 {#simple-statistic-example}

在大多数情况下，非规范化需要将单个列或统计信息添加到父行。例如，我们可能仅希望用重复帖子数量丰富我们的帖子，我们只需添加一列。

```sql
CREATE TABLE posts_with_duplicate_count
(
  `Id` Int32 CODEC(Delta(4), ZSTD(1)),
   ... -other columns
   `DuplicatePosts` UInt16
) ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
```

为了填充此表，我们利用 `INSERT INTO SELECT` 将我们的重复统计与帖子连接。

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

为了执行非规范化，我们通常需要利用复杂类型。如果正在非规范化一对一关系，且列数较少，用户可以像上面那样简单地将这些作为原始类型的行添加。然而，对于较大的对象来说，这通常并不理想，并且对于一对多关系也是不可能的。

在复杂对象或一对多关系的情况下，用户可以使用：

- 命名元组 - 这允许将相关结构表示为一组列。
- Array(Tuple) 或 Nested - 一个命名元组的数组，也称为嵌套，其中每个条目表示一个对象。适用于一对多关系。

作为示例，我们如下演示将 `PostLinks` 非规范化到 `Posts`。

每个帖子可以包含多个指向其他帖子的链接，如之前 `PostLinks` 模式所示。作为嵌套类型，我们可以将这些链接和重复的帖子表示如下：

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

> 注意使用设置 `flatten_nested=0`。我们建议禁用嵌套数据的扁平化。

我们可以使用 `INSERT INTO SELECT` 结合 `OUTER JOIN` 查询来执行此非规范化：

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

> 注意时间。我们已经在大约 2 分钟内非规范化了 66m 行。正如我们稍后看到的，这是我们可以安排的操作。

请注意，使用 `groupArray` 函数将 `PostLinks` 合并为每个 `PostId` 的数组，然后进行连接。该数组会过滤成两个子列表：`LinkedPosts` 和 `DuplicatePosts`，也排除外部连接的任何空结果。

我们可以选择一些行以查看我们的新非规范化结构：

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

## 组织和调度非规范化 {#orchestrating-and-scheduling-denormalization}

### 批处理 {#batch}

利用非规范化需要一个转换过程，可以在其中执行和组织。

我们已经展示了如何在 ClickHouse 中通过 `INSERT INTO SELECT` 执行此转换，一旦数据被加载。这适用于定期的批处理转换。

假设可以接受定期批量加载过程，用户有几种在 ClickHouse 中组织此操作的选项：

- **[可刷新的物化视图](/materialized-view/refreshable-materialized-view)** - 可刷新的物化视图可用于定期调度查询，并将结果发送到目标表中。在查询执行时，该视图确保目标表被原子性地更新。这为 ClickHouse 提供了一种本地调度此工作的方式。
- **外部工具** - 使用工具例如 [dbt](https://www.getdbt.com/) 和 [Airflow](https://airflow.apache.org/) 定期调度转换。用于 dbt 的 [ClickHouse 集成](/integrations/dbt) 确保以原子方式执行此操作，并创建目标表的新版本，然后与接收查询的版本原子性交换（通过 [EXCHANGE](/sql-reference/statements/exchange) 命令）。

### 流处理 {#streaming}

用户可能还希望在 ClickHouse 之外进行此操作，在插入之前，使用流处理技术，例如 [Apache Flink](https://flink.apache.org/)。或者，可以使用增量的 [物化视图](/guides/developer/cascading-materialized-views) 在数据插入时执行此过程。
