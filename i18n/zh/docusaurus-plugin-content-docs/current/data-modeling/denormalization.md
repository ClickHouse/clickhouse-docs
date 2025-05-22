import denormalizationDiagram from '@site/static/images/data-modeling/denormalization-diagram.png';
import denormalizationSchema from '@site/static/images/data-modeling/denormalization-schema.png';
import Image from '@theme/IdealImage';

# 数据非规范化

数据非规范化是在 ClickHouse 中使用扁平化表的一种技术，通过避免连接来帮助最小化查询延迟。

## 比较规范化与非规范化模式 {#comparing-normalized-vs-denormalized-schemas}

数据非规范化涉及故意逆转规范化过程，以优化数据库在特定查询模式下的性能。在规范化数据库中，数据被分割成多个相关表，以最小化冗余并确保数据完整性。非规范化通过合并表、重复数据并将计算字段合并到单个表或更少的表中重新引入冗余——有效地将任何连接从查询转移到插入时间。

这一过程减少了查询时对复杂连接的需求，可以显著加快读取操作，使其非常适合数据读取需求高和查询复杂的应用程序。然而，它可能会增加写入操作和维护的复杂性，因为对重复数据的任何更改必须在所有实例中传播，以保持一致性。

<Image img={denormalizationDiagram} size="lg" alt="ClickHouse中的非规范化"/>

<br />

一种被 NoSQL 解决方案普及的常见技术是在缺乏 `JOIN` 支持的情况下对数据进行非规范化，有效地将所有统计信息或相关行存储为父行的列和嵌套对象。例如，在一个博客的示例模式中，我们可以将所有 `Comments` 作为它们各自帖子的对象数组存储。

## 何时使用非规范化 {#when-to-use-denormalization}

一般情况下，我们建议在以下情况下进行非规范化：

- 进行非规范化的表不经常更改或可以容忍数据在分析查询可用之前的延迟，也就是说，数据可以在批处理中完全重新加载。
- 避免对多对多关系进行非规范化。如果单个源行更改，则可能需要更新多个行。
- 避免对高基数关系进行非规范化。如果一个表中的每一行在另一个表中都有数千个相关条目，这些将需要表示为 `Array`——可以是原始类型或元组。一般来说，不推荐包含超过 1000 个元组的数组。
- 而不是将所有列作为嵌套对象进行非规范化，考虑仅使用物化视图来非规范化一个统计信息（见下文）。

并非所有信息都需要进行非规范化——仅需要频繁访问的关键信息。

非规范化工作可以通过 ClickHouse 或上游处理，例如使用 Apache Flink。

## 避免对频繁更新的数据进行非规范化 {#avoid-denormalization-on-frequently-updated-data}

对于 ClickHouse，非规范化是用户为优化查询性能而可以使用的几种选项之一，但应谨慎使用。如果数据更新频繁并需要接近实时地进行更新，则应避免使用此方法。仅在主要表主要是仅追加的或可以定期以批处理方式重新加载（例如每日）时使用。

作为一种方法，它面临一个主要挑战——写入性能和数据更新。更具体地说，非规范化有效地将数据连接的责任从查询时间转移到摄取时间。虽然这可以显著改善查询性能，但它使连接变得复杂，并意味着如果组成其的任何行发生更改，数据管道需要重新将一行插入 ClickHouse。这可能意味着单个源行的更改可能意味着 ClickHouse 中需要更新多行。在复杂的模式中，当行是从复杂的连接组合而成时，连接的嵌套组件中的单个行更改可能意味着需要更新数百万行。

在实时中实现这一点往往是不切实际的，并且需要显著的工程量，因为有两个挑战：

1. 当表行更改时触发正确的连接语句。理想情况下，这不应导致连接的所有对象都被更新，而只是那些受到影响的对象。有效地修改连接以过滤到正确的行，在高吞吐量下实现这一点，需要外部工具或工程。
2. ClickHouse 中的行更新需要仔细管理，引入额外的复杂性。

<br />

因此，更常见的是批量更新过程，其中所有非规范化对象定期重新加载。

## 非规范化的实际案例 {#practical-cases-for-denormalization}

让我们考虑几个实际示例，其中非规范化可能是合理的，而其他地方则更希望采用替代方法。

考虑一个已非规范化的 `Posts` 表，具有统计信息，例如 `AnswerCount` 和 `CommentCount`——源数据已以此形式提供。实际上，我们可能想要真实地规范化这些信息，因为它们很可能会经常变化。许多这些列也可以通过其他表获得，例如，通过 `PostId` 列和 `Comments` 表可以获得帖子的评论。为了示例，我们假设帖子在批处理过程中被重新加载。

我们还只考虑将其他表非规范化到 `Posts`，因为我们认为这是我们的主要分析表。非规范化到另一个方向对于某些查询也合适，以上述相同的考虑适用。

*对于以下每个示例，假设存在一个需要使用两个表进行连接的查询。*

### 帖子和投票 {#posts-and-votes}

帖子的投票作为单独的表表示。优化模式如下所示，以及加载数据的插入命令：

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

乍一看，这些可能是帖子表上的非规范化候选者。然而，这种方法存在一些挑战。

投票经常被添加到帖子中。虽然这可能会随着时间的推移而减少，但以下查询显示我们在 30k 个帖子上每小时大约有 40k 次投票。

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

如果可以容忍延迟，这可以通过批处理来解决，但这仍然需要我们处理更新，除非我们周期性地重新加载所有帖子（不太可能是理想的）。

更麻烦的是某些帖子有极高数量的投票：

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

这里的主要观察是，每个帖子的聚合投票统计对于大多数分析都是足够的——我们不需要对所有投票信息进行非规范化。例如，当前的 `Score` 列代表这样的统计，即总的赞成票减去反对票。理想情况下，我们能够在查询时简单地检索这些统计（见 [字典](/dictionary)）。

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

虽然用户可能频繁获得徽章，但这不太可能是我们需要超过每日更新的数据集。徽章与用户之间的关系是一对多的。也许我们可以简单地将徽章作为元组列表非规范化到用户上？虽然可能，但快速检查确认每个用户的徽章数量表明这并不理想：

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

将 19k 个对象非规范化到单行上可能不切实际。这种关系最好作为单独的表保留或添加统计信息。

> 我们可能希望将徽章上的统计信息非规范化到用户上，例如徽章的数量。我们在插入此数据集时考虑使用字典时的这种示例。

### 帖子和帖子链接 {#posts-and-postlinks}

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

我们可以确认没有帖子具有过多的链接，阻碍非规范化：

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

在大多数情况下，非规范化只需要在父行上添加一个单独的列或统计。例如，我们可能只希望通过添加一列来丰富我们的帖子，以显示重复帖子的数量。

```sql
CREATE TABLE posts_with_duplicate_count
(
  `Id` Int32 CODEC(Delta(4), ZSTD(1)),
   ... -other columns
   `DuplicatePosts` UInt16
) ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
```

为了填充该表，我们利用 `INSERT INTO SELECT` 将我们的重复统计与帖子连接。

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

为了进行非规范化，我们通常需要利用复杂类型。如果是一对一关系正在进行非规范化，并且列数较少，用户可以简单地将这些添加为行，其原始类型如上所示。然而，对于较大的对象，这通常是不理想的，并且对于一对多关系是不可能的。

在复杂对象或一对多关系的情况下，用户可以使用：

- 命名元组 - 这些允许将相关结构表示为一组列。
- Array(Tuple) 或 Nested - 一组命名元组的数组，也称为嵌套，每个条目表示一个对象。适用于一对多关系。

例如，我们在下面演示将 `PostLinks` 非规范化到 `Posts`。

每个帖子可以包含若干链接到其他帖子的链接，如之前的 `PostLinks` 模式所示。作为嵌套类型，我们可以如下表示这些链接和重复的帖子：

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

我们可以使用带有 `OUTER JOIN` 查询的 `INSERT INTO SELECT` 来执行此非规范化：

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

> 注意此处的时间。我们已经在大约 2 分钟内成功地非规范化了 6600 万行。正如我们稍后将看到的，这是一个可以调度的操作。

请注意使用 `groupArray` 函数将 `PostLinks` 压缩到每个 `PostId` 的数组中，然后进行连接。此数组随后被过滤为两个子列表：`LinkedPosts` 和 `DuplicatePosts`，并排除了外连接中的任何空结果。

我们可以选择一些行来查看我们新的非规范化结构：

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

利用非规范化需要一个转换过程，其中可以执行和协调它。

我们已经展示了如何在通过 `INSERT INTO SELECT` 加载数据后使用 ClickHouse 执行此转换。这适合于定期批处理转换。

用户在 ClickHouse 中协调此过程时有几种选择，假设可接受周期性批处理加载过程：

- **[可刷新的物化视图](/materialized-view/refreshable-materialized-view)** - 可刷新的物化视图可以用来定期安排查询，结果发送到目标表。在查询执行时，视图确保目标表原子性更新。这提供了一种 ClickHouse 原生的工作调度方式。
- **外部工具** - 使用 [dbt](https://www.getdbt.com/) 和 [Airflow](https://airflow.apache.org/) 等工具定期安排转换。 [ClickHouse 与 dbt 的集成](/integrations/dbt) 确保在创建目标表的新版本时原子性地执行此操作，然后原子地与接收查询的版本进行交换（通过 [EXCHANGE](/sql-reference/statements/exchange) 命令）。

### 流式处理 {#streaming}

用户也可以希望在 ClickHouse 之外执行此操作，在插入之前，使用流式技术，例如 [Apache Flink](https://flink.apache.org/)。另外，可以使用增量 [物化视图](/guides/developer/cascading-materialized-views) 在数据插入时执行此过程。
