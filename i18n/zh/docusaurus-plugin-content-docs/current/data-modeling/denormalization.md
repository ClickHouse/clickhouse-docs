---
'slug': '/data-modeling/denormalization'
'title': '反规范化数据'
'description': '如何利用反规范化来提高查询性能'
'keywords':
- 'data denormalization'
- 'denormalize'
- 'query optimization'
'doc_type': 'guide'
---

import denormalizationDiagram from '@site/static/images/data-modeling/denormalization-diagram.png';
import denormalizationSchema from '@site/static/images/data-modeling/denormalization-schema.png';
import Image from '@theme/IdealImage';


# 非规范化数据

数据非规范化是 ClickHouse 中的一种技术，通过使用扁平化的表格来尽量减少查询延迟，从而避免连接操作。

## 比较规范化与非规范化模式 {#comparing-normalized-vs-denormalized-schemas}

非规范化数据涉及故意逆转规范化过程，以针对特定查询模式优化数据库性能。在规范化数据库中，数据被拆分为多个相关表，以最小化冗余并确保数据完整性。非规范化通过组合表、重复数据和将计算字段合并到单一表或较少的表中重新引入冗余——有效地将任何连接从查询时间移至插入时间。

该过程减少了查询时对复杂连接的需求，并能够显著加快读取操作，非常适合具有重读要求和复杂查询的应用程序。然而，它可能会增加写操作和维护的复杂性，因为对重复数据的任何更改必须在所有实例中传播以保持一致性。

<Image img={denormalizationDiagram} size="lg" alt="ClickHouse中的非规范化"/>

<br />

一种流行的技术是，在没有 `JOIN` 支持的情况下进行数据非规范化，有效地将所有统计信息或相关行存储为列和嵌套对象，作为父行的一部分。例如，在一个博客的示例模式中，我们可以将所有 `Comments` 作为对象的 `Array` 存储在各自的帖子上。

## 何时使用非规范化 {#when-to-use-denormalization}

一般而言，我们建议在以下情况下进行非规范化：

- 非规范化不经常变化的表，或在等待数据可用于分析查询时可以容忍延迟的情况，即数据可以在批处理中完全重新加载。
- 避免非规范化多对多关系。这可能会导致在单个源行更改时需要更新许多行。
- 避免非规范化高基数关系。如果表中的每一行在另一张表中都有成千上万的相关条目，这些条目需要用 `Array` 表示——可以是原始类型或元组。通常，不建议使用超过 1000 个元组的数组。
- 与其将所有列作为嵌套对象非规范化，不如考虑使用物化视图非规范化仅一个统计信息（见下文）。

并非所有信息都需要非规范化——只需非规范化需要频繁访问的关键信息。

非规范化的工作可以在 ClickHouse 中或上游处理，例如使用 Apache Flink。

## 避免在频繁更新的数据上进行非规范化 {#avoid-denormalization-on-frequently-updated-data}

对于 ClickHouse，非规范化是用户可以用来优化查询性能的几种选项之一，但应该谨慎使用。如果数据频繁更新并且需要近实时更新，则应该避免这种方法。如果主表主要是仅追加的，或可以定期作为批量重新加载，例如每日，那么可以使用这种方法。

这种方法面临一个主要挑战——写入性能和数据更新。更具体地说，非规范化事实上将数据连接的责任从查询时间转移到了摄取时间。虽然这可以显著提高查询性能，但它使摄取变得复杂，并且意味着如果任何用于组成该行的行发生变化，数据管道需要重新将该行插入 ClickHouse。这意味着，源行的一个变化可能意味着 ClickHouse 中需要更新许多行。在复杂的模式中，当行是从复杂的连接组合而成时，连接中的一个嵌套组件的单个行更改可能意味着需要更新数百万行。

在实时实现这一点通常是不切实际的，并且由于两个挑战需要大量的工程：

1. 当表行发生变化时，触发正确的连接语句。这理想情况下不应导致连接的所有对象都被更新，而应该仅仅更新那些受影响的对象。有效地修改连接以过滤到正确的行，并在高吞吐量下实现这一点，需要外部工具或工程。
2. 在 ClickHouse 中更新行需要精心管理，引入了额外的复杂性。

<br />

因此，批更新过程更为常见，在此过程中，所有的非规范化对象都定期重新加载。

## 非规范化的实际案例 {#practical-cases-for-denormalization}

让我们考虑几个可能使非规范化有意义的实际示例，以及其他一些更可取的替代方法。

考虑一个已经包含统计信息，例如 `AnswerCount` 和 `CommentCount` 的 `Posts` 表——源数据以这种形式提供。实际上，我们可能反而想要规范化这些信息，因为它们可能会频繁更改。这些列中的许多也可以通过其他表获得，例如，一个帖子的评论可以通过 `PostId` 列和 `Comments` 表获得。为了示例的目的，我们假设帖子是在批处理过程中重新加载的。

我们还只考虑将其他表非规范化到 `Posts`，因为我们视其为分析的主表。非规范化到其他方向针对某些查询也是合适的，以上述相同的考虑适用。

*在以下每个示例中，假设存在一个需要两个表进行连接的查询。*

### 帖子和投票 {#posts-and-votes}

帖子的投票作为单独的表表示。优化的模式如下所示，以及加载数据的插入命令：

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

乍一看，这些可能是帖子表的非规范化候选者。然而，这种方法面临一些挑战。

投票经常添加到帖子上。虽然这可能随着时间的推移而减少，但以下查询显示我们在 3 万篇帖子上每小时大约有 4 万次投票。

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

如果可以容忍延迟，这可以通过批处理解决，但这仍然需要我们处理更新，除非我们定期重新加载所有帖子（这不太可能是理想选择）。

更麻烦的是，一些帖子有极高的投票数：

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

主要观察是，对于大多数分析而言，聚合的投票统计信息对每个帖子的足够——我们没有必要非规范化所有投票信息。例如，当前的 `Score` 列表示这样的统计信息，即总的赞成票减去反对票。理想情况下，我们只需在查询时通过简单查找获取这些统计信息（见 [字典](/dictionary)）。

### 用户和徽章 {#users-and-badges}

现在让我们考虑我们的 `Users` 和 `Badges`：

<Image img={denormalizationSchema} size="lg" alt="用户和徽章模式"/>

<p></p>
我们首先通过以下命令插入数据：
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

虽然用户可能频繁获得徽章，但这不太可能是我们需要每天更新的数据集。徽章和用户之间是一对多的关系。也许我们可以简单地将徽章作为元组列表非规范化到用户？虽然可行，但快速检查每位用户的徽章数量表明这并不理想：

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

将 19,000 个对象非规范化到单一行可能并不现实。这种关系最好保留为单独的表，或增加统计信息。

> 我们可能希望将徽章的统计信息非规范化到用户，例如徽章数量。我们在插入此数据集时考虑使用字典的此类示例。

### 帖子和链接 {#posts-and-postlinks}

`PostLinks` 连接 `Posts`，用户认为它们是相关或重复的。以下查询显示模式和加载命令：

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

我们可以确认没有帖子有过多的链接，这阻碍了非规范化：

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
│                54 │                    44     │
└──────────────────┴──────────────────┘
```

我们将此用作下面的非规范化示例。

### 简单统计示例 {#simple-statistic-example}

在大多数情况下，非规范化需要在父行上添加单个列或统计信息。例如，我们可能只是希望通过重复的帖子数量来丰富我们的帖子，只需添加一列。

```sql
CREATE TABLE posts_with_duplicate_count
(
  `Id` Int32 CODEC(Delta(4), ZSTD(1)),
   ... -other columns
   `DuplicatePosts` UInt16
) ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
```

要填充该表，我们利用 `INSERT INTO SELECT` 将我们的重复统计信息与帖子连接。

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

### 利用复杂类型进行一对多关系 {#exploiting-complex-types-for-one-to-many-relationships}

为了执行非规范化，我们常常需要利用复杂类型。如果是低列数的一对一关系进行非规范化，用户可以简单地将这些行添加为其原始类型，如上所示。然而，对于较大的对象，这通常是不理想的，并且对于一对多关系则不可行。

在复杂对象或一对多关系的情况下，用户可以使用：

- 命名元组 - 这些允许相关结构作为一组列表示。
- Array(Tuple) 或 Nested - 一组命名元组的数组，也称为嵌套，每个条目表示一个对象。适用于一对多关系。

作为示例，我们在下面演示将 `PostLinks` 非规范化到 `Posts`。

每个帖子可以包含指向其他帖子的多个链接，如先前的 `PostLinks` 模式所示。作为嵌套类型，我们可以如下表示这些链接和重复的帖子：

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

> 请注意 `flatten_nested=0` 的设置。我们建议禁用嵌套数据的扁平化。

我们可以使用 `INSERT INTO SELECT` 和 `OUTER JOIN` 查询执行此非规范化：

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

> 请注意这里的时间。我们在大约 2 分钟内成功地非规范化了 6600 万行。如我们稍后将看到的，这是一个可以调度的操作。

请注意使用 `groupArray` 函数将 `PostLinks` 合并为每个 `PostId` 的数组，随后进行连接。该数组然后被过滤为两个子列表：`LinkedPosts` 和 `DuplicatePosts`，同时也排除了来自外部连接的任何空结果。

我们可以选择一些行，以查看我们新的非规范化结构：

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

## 协调和调度非规范化 {#orchestrating-and-scheduling-denormalization}

### 批处理 {#batch}

利用非规范化需要一个转换过程，在此过程中可以执行和协调它。

我们在上面演示了如何在数据通过 `INSERT INTO SELECT` 加载后，使用 ClickHouse 执行此转换。这适用 于定期批量转换。

用户在 ClickHouse 中协调此操作有几种选择，假设定期批处理加载过程是可接受的：

- **[可刷新的物化视图](/materialized-view/refreshable-materialized-view)** - 可刷新的物化视图可用于定期调度查询，并将结果发送到目标表。在查询执行时，该视图确保目标表被原子性更新。这提供了 ClickHouse 原生调度此工作的方式。
- **外部工具** - 利用 [dbt](https://www.getdbt.com/) 和 [Airflow](https://airflow.apache.org/) 等工具定期调度转换。 [ClickHouse与dbt的集成](/integrations/dbt) 确保此操作是原子性的，创建新版本的目标表，然后与接收查询的版本原子交换（通过 [EXCHANGE](/sql-reference/statements/exchange) 命令）。

### 流式处理 {#streaming}

用户可能还希望在 ClickHouse 之外进行此操作，插入前使用流式技术，例如 [Apache Flink](https://flink.apache.org/)。或者，还可以使用增量 [物化视图](/guides/developer/cascading-materialized-views) 在数据插入时执行此过程。
