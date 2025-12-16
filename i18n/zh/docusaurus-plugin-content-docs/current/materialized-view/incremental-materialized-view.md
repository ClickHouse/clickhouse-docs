---
slug: /materialized-view/incremental-materialized-view
title: '增量materialized view'
description: '如何使用增量materialized view 加速查询'
keywords: ['增量materialized view', '加速查询', '查询优化']
score: 10000
doc_type: 'guide'
---

import materializedViewDiagram from '@site/static/images/materialized-view/materialized-view-diagram.png';
import Image from '@theme/IdealImage';


## 背景 {#background}

增量materialized view（Materialized Views）允许将计算成本从查询阶段转移到插入阶段，从而加速 `SELECT` 查询。

与 Postgres 等事务型数据库不同，ClickHouse 中的 materialized view 只是一个触发器，它会在数据块插入到表中时对其运行一次查询。该查询的结果会被插入到第二个“目标”表中。如果有更多行被插入，结果将再次写入目标表，在那里中间结果会被更新并合并。这个合并后的结果等价于在所有原始数据上运行一次查询。

使用 Materialized Views 的主要目的在于，插入到目标表中的结果代表了对这些行进行聚合、过滤或转换后的结果。这些结果通常是原始数据的压缩表示（在聚合场景下是部分近似概要）。再加上从目标表中读取这些结果时所需的查询非常简单，可以确保查询时间比在原始数据上执行相同计算更快，也就是将计算（从而也就是查询延迟）从查询时转移到插入时。

ClickHouse 中的 materialized views 会随着数据流入其所依赖的表而实时更新，其行为更像是持续更新的索引。这与其他数据库形成对比，在那些数据库中，Materialized Views 通常是查询的静态快照，必须显式刷新（类似于 ClickHouse 的 [Refreshable Materialized Views](/sql-reference/statements/create/view#refreshable-materialized-view)）。

<Image img={materializedViewDiagram} size="md" alt="Materialized view 图示"/>

## 示例 {#example}

作为示例，我们将使用在 [&quot;Schema Design&quot;](/data-modeling/schema-design) 中描述的 Stack Overflow 数据集。

假设我们想要统计某个帖子每天的赞成票和反对票数量。

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

0 rows in set. Elapsed: 29.359 sec. Processed 238.98 million rows, 2.13 GB (8.14 million rows/s., 72.45 MB/s.)
```

得益于 [`toStartOfDay`](/sql-reference/functions/date-time-functions#toStartOfDay) 函数，在 ClickHouse 中这个查询相当简单：

```sql
SELECT toStartOfDay(CreationDate) AS day,
       countIf(VoteTypeId = 2) AS UpVotes,
       countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY day
ORDER BY day ASC
LIMIT 10

┌─────────────────day─┬─UpVotes─┬─DownVotes─┐
│ 2008-07-31 00:00:00 │       6 │         0 │
│ 2008-08-01 00:00:00 │     182 │        50 │
│ 2008-08-02 00:00:00 │     436 │       107 │
│ 2008-08-03 00:00:00 │     564 │       100 │
│ 2008-08-04 00:00:00 │    1306 │       259 │
│ 2008-08-05 00:00:00 │    1368 │       269 │
│ 2008-08-06 00:00:00 │    1701 │       211 │
│ 2008-08-07 00:00:00 │    1544 │       211 │
│ 2008-08-08 00:00:00 │    1241 │       212 │
│ 2008-08-09 00:00:00 │     576 │        46 │
└─────────────────────┴─────────┴───────────┘

10 rows in set. Elapsed: 0.133 sec. Processed 238.98 million rows, 2.15 GB (1.79 billion rows/s., 16.14 GB/s.)
Peak memory usage: 363.22 MiB.
```

得益于 ClickHouse，这个查询已经非常快了，但我们还能进一步优化吗？

如果我们想在插入时就通过 materialized view 来完成这类计算，我们需要一张表来接收结果。该表每天只应保留 1 行。如果收到某一天的更新，该天对应行中的其他列的值应合并到现有行中。要实现这种增量状态的合并，就必须为其他列存储部分（中间）状态。

这在 ClickHouse 中需要一种特殊的引擎类型：[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)。它会将所有具有相同排序键的行替换为一行，其中数值列为累加后的结果。下面的表会合并任何具有相同日期的行，对所有数值列进行求和：

```sql
CREATE TABLE up_down_votes_per_day
(
  `Day` Date,
  `UpVotes` UInt32,
  `DownVotes` UInt32
)
ENGINE = SummingMergeTree
ORDER BY Day
```

为了演示这个 materialized view，假设当前 `votes` 表为空，尚未接收任何数据。我们的 materialized view 会对插入到 `votes` 中的数据执行上述 `SELECT`，并将结果写入 `up_down_votes_per_day`：

```sql
CREATE MATERIALIZED VIEW up_down_votes_per_day_mv TO up_down_votes_per_day AS
SELECT toStartOfDay(CreationDate)::Date AS Day,
       countIf(VoteTypeId = 2) AS UpVotes,
       countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY Day
```

这里的 `TO` 子句是关键，它表示结果将被发送到哪里，即发送到 `up_down_votes_per_day`。

我们可以基于之前的插入操作重新填充我们的 votes 表：


```sql
INSERT INTO votes SELECT toUInt32(Id) AS Id, toInt32(PostId) AS PostId, VoteTypeId, CreationDate, UserId, BountyAmount
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/*.parquet')

0 rows in set. Elapsed: 111.964 sec. Processed 477.97 million rows, 3.89 GB (4.27 million rows/s., 34.71 MB/s.)
Peak memory usage: 283.49 MiB.
```

完成后，我们可以确认 `up_down_votes_per_day` 的大小——我们应该是每天 1 行：

```sql
SELECT count()
FROM up_down_votes_per_day
FINAL

┌─count()─┐
│    5723 │
└─────────┘
```

在这里，我们实际上通过存储查询结果，将行数从 2.38 亿（`votes` 表中）减少到了 5000。不过，这里关键的一点是：如果有新的投票插入到 `votes` 表中，相应的新值会写入到对应日期的 `up_down_votes_per_day` 中，并在后台以异步方式自动合并——从而保证每天仅保留一行。因此，`up_down_votes_per_day` 将始终既小巧又保持最新。

由于行的合并是异步进行的，当用户发起查询时，同一天可能会存在多于一行的投票数据。为了确保在查询时将所有尚未合并的行合并到位，我们有两个选项：

* 在表名上使用 `FINAL` 修饰符。我们在上面的计数查询中就是这样做的。
* 按最终表中使用的排序键进行聚合，即按 `CreationDate` 分组并对指标求和。通常这种方式更高效且更灵活（该表可以用于其他用途），但前一种方式对于某些查询会更简单。我们在下面展示这两种方法：

```sql
SELECT
        Day,
        UpVotes,
        DownVotes
FROM up_down_votes_per_day
FINAL
ORDER BY Day ASC
LIMIT 10

10 rows in set. Elapsed: 0.004 sec. Processed 8.97 thousand rows, 89.68 KB (2.09 million rows/s., 20.89 MB/s.)
Peak memory usage: 289.75 KiB.

SELECT Day, sum(UpVotes) AS UpVotes, sum(DownVotes) AS DownVotes
FROM up_down_votes_per_day
GROUP BY Day
ORDER BY Day ASC
LIMIT 10
┌────────Day─┬─UpVotes─┬─DownVotes─┐
│ 2008-07-31 │       6 │         0 │
│ 2008-08-01 │     182 │        50 │
│ 2008-08-02 │     436 │       107 │
│ 2008-08-03 │     564 │       100 │
│ 2008-08-04 │    1306 │       259 │
│ 2008-08-05 │    1368 │       269 │
│ 2008-08-06 │    1701 │       211 │
│ 2008-08-07 │    1544 │       211 │
│ 2008-08-08 │    1241 │       212 │
│ 2008-08-09 │     576 │        46 │
└────────────┴─────────┴───────────┘

10 rows in set. Elapsed: 0.010 sec. Processed 8.97 thousand rows, 89.68 KB (907.32 thousand rows/s., 9.07 MB/s.)
Peak memory usage: 567.61 KiB.
```

这将把我们的查询耗时从 0.133 秒缩短到 0.004 秒——提升超过 25 倍！

:::important 重要提示：`ORDER BY` = `GROUP BY`
在大多数情况下，如果使用 `SummingMergeTree` 或 `AggregatingMergeTree` 表引擎，那么在 materialized view 转换中用于 `GROUP BY` 子句的列，应当与目标表中 `ORDER BY` 子句所使用的列保持一致。这些引擎依赖 `ORDER BY` 列在后台合并操作期间合并具有相同值的行。如果 `GROUP BY` 与 `ORDER BY` 列不对齐，可能会导致查询性能下降、合并效果不佳，甚至产生数据不一致。
:::


### 一个更复杂的示例 {#a-more-complex-example}

上面的示例使用 Materialized Views 来计算并维护每天的两个求和结果。求和是在维护中间聚合状态时最简单的聚合形式——当有新值到来时，我们只需将其累加到现有值上即可。不过，ClickHouse 的 Materialized Views 可用于任何类型的聚合。

假设我们希望为每天的帖子计算一些统计量：`Score` 的 99.9 分位数，以及 `CommentCount` 的平均值。用于计算该结果的查询可能如下所示：

```sql
SELECT
        toStartOfDay(CreationDate) AS Day,
        quantile(0.999)(Score) AS Score_99th,
        avg(CommentCount) AS AvgCommentCount
FROM posts
GROUP BY Day
ORDER BY Day DESC
LIMIT 10

┌─────────────────Day─┬────────Score_99th─┬────AvgCommentCount─┐
│ 2024-03-31 00:00:00 │  5.23700000000008 │ 1.3429811866859624 │
│ 2024-03-30 00:00:00 │                 5 │ 1.3097158891616976 │
│ 2024-03-29 00:00:00 │  5.78899999999976 │ 1.2827635327635327 │
│ 2024-03-28 00:00:00 │                 7 │  1.277746158224246 │
│ 2024-03-27 00:00:00 │ 5.738999999999578 │ 1.2113264918282023 │
│ 2024-03-26 00:00:00 │                 6 │ 1.3097536945812809 │
│ 2024-03-25 00:00:00 │                 6 │ 1.2836721018539201 │
│ 2024-03-24 00:00:00 │ 5.278999999999996 │ 1.2931667891256429 │
│ 2024-03-23 00:00:00 │ 6.253000000000156 │  1.334061135371179 │
│ 2024-03-22 00:00:00 │ 9.310999999999694 │ 1.2388059701492538 │
└─────────────────────┴───────────────────┴────────────────────┘

10 rows in set. Elapsed: 0.113 sec. Processed 59.82 million rows, 777.65 MB (528.48 million rows/s., 6.87 GB/s.)
Peak memory usage: 658.84 MiB.
```

与之前一样，我们可以创建一个 materialized view，在有新帖子插入到 `posts` 表时执行上述查询。

为了示例说明，并避免从 S3 加载帖子数据，我们将创建一个与 `posts` 具有相同 schema 的副本表 `posts_null`。不过，此表不会存储任何数据，只会在插入行时被 materialized view 使用。为防止数据被存储，我们可以使用 [`Null` 表引擎类型](/engines/table-engines/special/null)。

```sql
CREATE TABLE posts_null AS posts ENGINE = Null
```

Null 表引擎是一种强大的优化手段——可以将其视为 `/dev/null`。我们的 materialized view 会在 `posts_null` 表插入行数据时计算并存储汇总统计信息——它就像一个触发器。然而，原始数据并不会被存储。虽然在我们的场景中，我们可能仍然希望保留原始帖子，但这种方法可以在避免存储原始数据开销的同时计算聚合结果。

因此，materialized view 定义如下：

```sql
CREATE MATERIALIZED VIEW post_stats_mv TO post_stats_per_day AS
       SELECT toStartOfDay(CreationDate) AS Day,
       quantileState(0.999)(Score) AS Score_quantiles,
       avgState(CommentCount) AS AvgCommentCount
FROM posts_null
GROUP BY Day
```

请注意我们是如何在聚合函数名末尾添加后缀 `State` 的。这样可以确保返回的是函数的聚合状态，而不是最终结果。该状态会包含额外信息，使得这个部分状态可以与其他状态合并。例如，在求平均值的情况下，其中会包含该列的计数与求和。

> 部分聚合状态对于计算正确结果是必需的。例如，在计算平均值时，简单地对各个子区间的平均值再取平均会产生不正确的结果。

现在我们为该视图 `post_stats_per_day` 创建目标表，用于存储这些部分聚合状态：


```sql
CREATE TABLE post_stats_per_day
(
  `Day` Date,
  `Score_quantiles` AggregateFunction(quantile(0.999), Int32),
  `AvgCommentCount` AggregateFunction(avg, UInt8)
)
ENGINE = AggregatingMergeTree
ORDER BY Day
```

虽然之前使用 `SummingMergeTree` 足以存储计数，但对于其他函数，我们需要更高级的引擎类型：[`AggregatingMergeTree`](/engines/table-engines/mergetree-family/aggregatingmergetree)。
为确保 ClickHouse 知道将会存储聚合状态，我们将 `Score_quantiles` 和 `AvgCommentCount` 定义为 `AggregateFunction` 类型，并指定用于生成部分状态的聚合函数以及其源列的类型。与 `SummingMergeTree` 类似，具有相同 `ORDER BY` 键值的行会被合并（在上面的示例中为 `Day`）。

为了通过 materialized view 填充我们的 `post_stats_per_day`，我们可以简单地将 `posts` 中的所有行插入到 `posts_null` 表中：

```sql
INSERT INTO posts_null SELECT * FROM posts

0 rows in set. Elapsed: 13.329 sec. Processed 119.64 million rows, 76.99 GB (8.98 million rows/s., 5.78 GB/s.)
```

> 在生产环境中，通常会将该 materialized view 挂载到 `posts` 表上。这里使用 `posts_null` 是为了演示 null 表。

我们的最终查询需要为函数使用 `Merge` 后缀（因为这些列存储的是部分聚合状态）：

```sql
SELECT
        Day,
        quantileMerge(0.999)(Score_quantiles),
        avgMerge(AvgCommentCount)
FROM post_stats_per_day
GROUP BY Day
ORDER BY Day DESC
LIMIT 10
```

注意，这里使用 `GROUP BY` 而不是 `FINAL`。


## 其他应用 {#other-applications}

上述内容主要介绍如何使用 materialized view 对数据的部分聚合进行增量更新，从而将计算从查询时转移到写入时。除这一常见用例之外，materialized view 还有许多其他用法。

### 过滤和转换 {#filtering-and-transformation}

在某些情况下，我们可能只希望在插入时仅写入部分行和列。在这种情况下，可以先向我们的 `posts_null` 表插入数据，然后使用 `SELECT` 查询在写入 `posts` 表之前对行进行过滤。举例来说，假设我们希望转换 `posts` 表中的 `Tags` 列。该列包含一个以竖线分隔的标签名称列表。通过将其转换为数组，我们可以更方便地按单个标签值进行聚合。

> 我们可以在执行 `INSERT INTO SELECT` 时进行这种转换。materialized view 允许我们在 ClickHouse DDL 中封装此逻辑，使我们的 `INSERT` 语句保持简单，同时自动将转换应用于所有新行。

用于此转换的 materialized view 如下所示：

```sql
CREATE MATERIALIZED VIEW posts_mv TO posts AS
        SELECT * EXCEPT Tags, arrayFilter(t -> (t != ''), splitByChar('|', Tags)) as Tags FROM posts_null
```


### 查找表 {#lookup-table}

在选择 ClickHouse 排序键时，应当考虑访问模式。应优先选择那些在过滤和聚合子句中被频繁使用的列。对于用户访问模式更加多样、无法被单一列集合概括的场景，这可能会带来一定限制。例如，考虑下面这个 `comments` 表：

```sql
CREATE TABLE comments
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
ORDER BY PostId

0 rows in set. Elapsed: 46.357 sec. Processed 90.38 million rows, 11.14 GB (1.95 million rows/s., 240.22 MB/s.)
```

这里的排序键使表针对按 `PostId` 过滤的查询得到了优化。

假设某位用户希望基于特定的 `UserId` 进行过滤，并计算该用户的平均 `Score`：

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

┌──────────avg(Score)─┐
│ 0.18181818181818182 │
└─────────────────────┘

1 row in set. Elapsed: 0.778 sec. Processed 90.38 million rows, 361.59 MB (116.16 million rows/s., 464.74 MB/s.)
Peak memory usage: 217.08 MiB.
```

虽然对于 ClickHouse 来说这很快（数据量较小），但从处理的行数——9038 万——可以看出，这需要一次完整的表扫描。对于更大的数据集，我们可以使用 materialized view 来查找用于过滤列 `UserId` 的排序键值 `PostId`。然后可以使用这些值来执行高效的查找。

在这个示例中，我们的 materialized view 可以非常简单，只需在插入时从 `comments` 中选取 `PostId` 和 `UserId`。这些结果随后被写入到按 `UserId` 排序的表 `comments_posts_users` 中。我们在下方创建一个 `Comments` 表的空表版本，并使用它来填充我们的 materialized view 和 `comments_posts_users` 表：

```sql
CREATE TABLE comments_posts_users (
  PostId UInt32,
  UserId Int32
) ENGINE = MergeTree ORDER BY UserId

CREATE TABLE comments_null AS comments
ENGINE = Null

CREATE MATERIALIZED VIEW comments_posts_users_mv TO comments_posts_users AS
SELECT PostId, UserId FROM comments_null

INSERT INTO comments_null SELECT * FROM comments

0 rows in set. Elapsed: 5.163 sec. Processed 90.38 million rows, 17.25 GB (17.51 million rows/s., 3.34 GB/s.)
```

我们现在可以在子查询中使用此 VIEW，从而加速我们之前的查询：

```sql
SELECT avg(Score)
FROM comments
WHERE PostId IN (
        SELECT PostId
        FROM comments_posts_users
        WHERE UserId = 8592047
) AND UserId = 8592047

┌──────────avg(Score)─┐
│ 0.18181818181818182 │
└─────────────────────┘

1 row in set. Elapsed: 0.012 sec. Processed 88.61 thousand rows, 771.37 KB (7.09 million rows/s., 61.73 MB/s.)
```


### 串联 / 级联 materialized view {#chaining}

materialized view 之间可以进行串联（或级联），从而建立复杂的工作流。
欲了解更多信息，请参阅指南《[级联 materialized view](https://clickhouse.com/docs/guides/developer/cascading-materialized-views)》。

## materialized view 与 JOIN {#materialized-views-and-joins}

:::note 可刷新materialized view
以下内容仅适用于增量materialized view。可刷新materialized view 会定期针对完整目标数据集执行其查询，并完全支持 JOIN。对于复杂 JOIN，如果可以接受结果新鲜度有所降低，请考虑使用可刷新materialized view。
:::

ClickHouse 中的增量materialized view 完全支持 `JOIN` 操作，但有一个关键约束：**materialized view 只会在对源表（查询中最左侧的表）进行插入时触发。** 即使 JOIN 中右侧的表数据发生变化，也不会触发更新。在构建**增量**materialized view 时，这一行为尤其重要，因为数据会在插入时被聚合或转换。

当使用 `JOIN` 定义一个增量materialized view 时，`SELECT` 查询中最左侧的表充当源表。当有新行插入该表时，ClickHouse 仅使用这些新插入的行来执行该 materialized view 对应的查询。JOIN 中右侧的表在执行过程中会被完整读取，但仅对它们进行更改并不会触发该 view。

这种行为使得 materialized view 中的 JOIN 类似于针对静态维度数据的快照式 JOIN。

这非常适合使用引用表或维度表来丰富数据。然而，对右侧表（例如用户元数据）的任何更新，都不会对已有的 materialized view 结果进行追溯更新。要看到更新后的数据，必须向源表写入新的插入数据。

### 示例 {#materialized-views-and-joins-example}

下面通过一个具体示例来说明，使用 [Stack Overflow 数据集](/data-modeling/schema-design)。我们将使用一个 materialized view 来计算**每位用户每天获得的徽章数量**，并从 `users` 表中获取该用户的显示名称。

先回顾一下我们的表结构：

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

CREATE TABLE users
(
    `Id` Int32,
    `Reputation` UInt32,
    `CreationDate` DateTime64(3, 'UTC'),
    `DisplayName` LowCardinality(String),
    `LastAccessDate` DateTime64(3, 'UTC'),
    `Location` LowCardinality(String),
    `Views` UInt32,
    `UpVotes` UInt32,
    `DownVotes` UInt32
)
ENGINE = MergeTree
ORDER BY Id;
```

我们假设 `users` 表中已经有数据：

```sql
INSERT INTO users
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/users.parquet');
```

materialized view 及其对应的目标表定义如下：

```sql
CREATE TABLE daily_badges_by_user
(
    Day Date,
    UserId Int32,
    DisplayName LowCardinality(String),
    Gold UInt32,
    Silver UInt32,
    Bronze UInt32
)
ENGINE = SummingMergeTree
ORDER BY (DisplayName, UserId, Day);

CREATE MATERIALIZED VIEW daily_badges_by_user_mv TO daily_badges_by_user AS
SELECT
    toDate(Date) AS Day,
    b.UserId,
    u.DisplayName,
    countIf(Class = 'Gold') AS Gold,
    countIf(Class = 'Silver') AS Silver,
    countIf(Class = 'Bronze') AS Bronze
FROM badges AS b
LEFT JOIN users AS u ON b.UserId = u.Id
GROUP BY Day, b.UserId, u.DisplayName;
```

:::note 分组与排序对齐
materialized view 中的 `GROUP BY` 子句必须包含 `DisplayName`、`UserId` 和 `Day`，以与目标 `SummingMergeTree` 表中的 `ORDER BY` 对齐。这可确保行被正确聚合和合并。省略其中任意一个都可能导致结果不正确或合并低效。
:::

如果现在填充徽章数据（badges），该 materialized view 将被触发，从而填充我们的 `daily_badges_by_user` 表。

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 433.762 sec. Processed 1.16 billion rows, 28.50 GB (2.67 million rows/s., 65.70 MB/s.)
```

假设我们想要查看某个特定用户所获得的徽章，可以编写如下查询语句：


```sql
SELECT *
FROM daily_badges_by_user
FINAL
WHERE DisplayName = 'gingerwizard'

┌────────Day─┬──UserId─┬─DisplayName──┬─Gold─┬─Silver─┬─Bronze─┐
│ 2023-02-27 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2023-02-28 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2013-10-30 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2024-03-04 │ 2936484 │ gingerwizard │    0 │      1 │      0 │
│ 2024-03-05 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2023-04-17 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2013-11-18 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2023-10-31 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
└────────────┴─────────┴──────────────┴──────┴────────┴────────┘

8 rows in set. Elapsed: 0.018 sec. Processed 32.77 thousand rows, 642.14 KB (1.86 million rows/s., 36.44 MB/s.)
```

现在，如果该用户获得一个新的徽章，并插入一行记录，我们的视图就会被更新：

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 7.517 sec.

SELECT *
FROM daily_badges_by_user
FINAL
WHERE DisplayName = 'gingerwizard'
┌────────Day─┬──UserId─┬─DisplayName──┬─Gold─┬─Silver─┬─Bronze─┐
│ 2013-10-30 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2013-11-18 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2023-02-27 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2023-02-28 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2023-04-17 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2023-10-31 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2024-03-04 │ 2936484 │ gingerwizard │    0 │      1 │      0 │
│ 2024-03-05 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2025-04-13 │ 2936484 │ gingerwizard │    1 │      0 │      0 │
└────────────┴─────────┴──────────────┴──────┴────────┴────────┘

9 rows in set. Elapsed: 0.017 sec. Processed 32.77 thousand rows, 642.27 KB (1.96 million rows/s., 38.50 MB/s.)
```

:::warning
请注意此处插入操作的延迟。插入的 user 行会与整个 `users` 表进行 JOIN，这会显著影响插入性能。我们在下文[“在过滤和 JOIN 中使用源表”](/materialized-view/incremental-materialized-view#using-source-table-in-filters-and-joins-in-materialized-views)中提出了应对该问题的方法。
:::

相反地，如果我们先为一个新用户插入一条 badge 记录，然后再插入该用户的行，我们的 materialized view 将无法捕获该用户的指标数据。

```sql
INSERT INTO badges VALUES (53505059, 23923286, 'Good Answer', now(), 'Bronze', 0);
INSERT INTO users VALUES (23923286, 1, now(),  'brand_new_user', now(), 'UK', 1, 1, 0);
```


```sql
SELECT *
FROM daily_badges_by_user
FINAL
WHERE DisplayName = 'brand_new_user';

0 rows in set. Elapsed: 0.017 sec. Processed 32.77 thousand rows, 644.32 KB (1.98 million rows/s., 38.94 MB/s.)
```

在这种情况下，该 VIEW 只会在 user 行尚不存在时，为 badge 的那次插入执行。若我们为该 user 再插入一个 badge，就会插入一行数据，这是符合预期的：

```sql
INSERT INTO badges VALUES (53505060, 23923286, 'Teacher', now(), 'Bronze', 0);

SELECT *
FROM daily_badges_by_user
FINAL
WHERE DisplayName = 'brand_new_user'

┌────────Day─┬───UserId─┬─DisplayName────┬─Gold─┬─Silver─┬─Bronze─┐
│ 2025-04-13 │ 23923286 │ brand_new_user │    0 │      0 │      1 │
└────────────┴──────────┴────────────────┴──────┴────────┴────────┘

1 row in set. Elapsed: 0.018 sec. Processed 32.77 thousand rows, 644.48 KB (1.87 million rows/s., 36.72 MB/s.)
```

但需要注意，这个结果是不正确的。


### materialized view 中 JOIN 的最佳实践 {#join-best-practices}

- **使用最左侧的表作为触发源。** 只有 `SELECT` 语句左侧的表会触发 materialized view。右侧表中的更改不会触发更新。

- **预先插入参与 JOIN 的数据。** 确保参与 JOIN 的表中的数据在向源表插入行之前就已存在。JOIN 在插入时执行，如果数据缺失，将导致行无法匹配或得到空值。

- **限制从 JOIN 中读取的列。** 仅从 JOIN 的表中选择所需的列，以最小化内存使用并减少插入时延迟（见下文）。

- **评估插入时性能。** JOIN 会增加插入成本，尤其是在右侧表很大的情况下。使用具有代表性的生产数据对插入速率进行基准测试。

- **简单查找时优先使用字典。** 对于键值查找（例如 user ID 到名称映射），使用 [Dictionaries](/dictionary) 以避免代价高昂的 JOIN 操作。

- **对齐 `GROUP BY` 与 `ORDER BY` 以提升合并效率。** 当使用 `SummingMergeTree` 或 `AggregatingMergeTree` 时，确保 `GROUP BY` 与目标表中的 `ORDER BY` 子句一致，以便高效地合并行。

- **使用显式列别名。** 当表之间存在重名列时，使用别名以避免歧义，并确保目标表中的结果正确。

- **考虑插入量和插入频率。** JOIN 在中等插入负载场景下表现良好。对于高吞吐摄取场景，考虑使用中间表、预先 JOIN，或诸如字典与 [可刷新materialized view](/materialized-view/refreshable-materialized-view) 等其他方案。

### 在过滤和 JOIN 中使用源表 {#using-source-table-in-filters-and-joins-in-materialized-views}

在 ClickHouse 中使用 materialized view 时，理解源表在执行 materialized view 查询过程中是如何处理的非常重要。具体来说，materialized view 查询中的源表会被当前插入的数据块所替代。如果没有正确理解这一行为，可能会导致一些出乎意料的结果。

#### 示例场景 {#example-scenario}

假设有如下设置：

```sql
CREATE TABLE t0 (`c0` Int) ENGINE = Memory;
CREATE TABLE mvw1_inner (`c0` Int) ENGINE = Memory;
CREATE TABLE mvw2_inner (`c0` Int) ENGINE = Memory;

CREATE VIEW vt0 AS SELECT * FROM t0;

CREATE MATERIALIZED VIEW mvw1 TO mvw1_inner
AS SELECT count(*) AS c0
    FROM t0
    LEFT JOIN ( SELECT * FROM t0 ) AS x ON t0.c0 = x.c0;

CREATE MATERIALIZED VIEW mvw2 TO mvw2_inner
AS SELECT count(*) AS c0
    FROM t0
    LEFT JOIN vt0 ON t0.c0 = vt0.c0;

INSERT INTO t0 VALUES (1),(2),(3);

INSERT INTO t0 VALUES (1),(2),(3),(4),(5);

SELECT * FROM mvw1;
┌─c0─┐
│  3 │
│  5 │
└────┘

SELECT * FROM mvw2;
┌─c0─┐
│  3 │
│  8 │
└────┘
```


#### 说明 {#explanation}

在上述示例中，我们有两个 materialized view：`mvw1` 和 `mvw2`。它们执行的操作类似，但在引用源表 `t0` 的方式上略有不同。

在 `mvw1` 中，表 `t0` 在 JOIN 右侧是通过子查询 `(SELECT * FROM t0)` 被直接引用的。当数据插入到 `t0` 时，会执行该 materialized view 的查询，并用这次插入的数据块来替代对 `t0` 的引用。也就是说，JOIN 操作只会在新插入的行上执行，而不是在整张表上执行。

在第二种与 `vt0` 进行 JOIN 的情况中，该 view 会从 `t0` 中读取全部数据。这确保了 JOIN 操作会考虑 `t0` 中的所有行，而不仅仅是新插入的数据块。

关键区别在于 ClickHouse 在 materialized view 的查询中如何处理源表。当 materialized view 由一次插入操作触发时，源表（在本例中是 `t0`）会被这次插入的数据块所替代。可以利用这种行为来优化查询，但也需要谨慎使用，以避免出现意料之外的结果。

### 使用场景与注意事项 {#use-cases-and-caveats}

在实际使用中，可以利用这一行为来优化仅需处理源表部分数据的 materialized view。比如，你可以使用子查询在将源表与其他表进行 JOIN 之前先对源表进行过滤。这样可以减少 materialized view 需要处理的数据量，并提升性能。

```sql
CREATE TABLE t0 (id UInt32, value String) ENGINE = MergeTree() ORDER BY id;
CREATE TABLE t1 (id UInt32, description String) ENGINE = MergeTree() ORDER BY id;
INSERT INTO t1 VALUES (1, 'A'), (2, 'B'), (3, 'C');

CREATE TABLE mvw1_target_table (id UInt32, value String, description String) ENGINE = MergeTree() ORDER BY id;

CREATE MATERIALIZED VIEW mvw1 TO mvw1_target_table AS
SELECT t0.id, t0.value, t1.description
FROM t0
JOIN (SELECT * FROM t1 WHERE t1.id IN (SELECT id FROM t0)) AS t1
ON t0.id = t1.id;
```

在这个示例中，由子查询 `IN (SELECT id FROM t0)` 构建的 Set 只包含新插入的行，这有助于据此过滤 `t1`。


#### 以 Stack Overflow 为例 {#example-with-stack-overflow}

回顾我们之前的 [materialized view 示例](/materialized-view/incremental-materialized-view#example)，用于计算**每个用户每天获得的徽章数**，并从 `users` 表中获取用户的显示名称。

```sql
CREATE MATERIALIZED VIEW daily_badges_by_user_mv TO daily_badges_by_user
AS SELECT
    toDate(Date) AS Day,
    b.UserId,
    u.DisplayName,
    countIf(Class = 'Gold') AS Gold,
    countIf(Class = 'Silver') AS Silver,
    countIf(Class = 'Bronze') AS Bronze
FROM badges AS b
LEFT JOIN users AS u ON b.UserId = u.Id
GROUP BY Day, b.UserId, u.DisplayName;
```

该视图对 `badges` 表的插入延迟产生了显著影响，例如：

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 7.517 sec.
```

使用上述方法，我们可以优化此视图。我们将基于插入的徽章行中的用户 ID，为 `users` 表添加一个过滤条件：

```sql
CREATE MATERIALIZED VIEW daily_badges_by_user_mv TO daily_badges_by_user
AS SELECT
    toDate(Date) AS Day,
    b.UserId,
    u.DisplayName,
    countIf(Class = 'Gold') AS Gold,
    countIf(Class = 'Silver') AS Silver,
    countIf(Class = 'Bronze') AS Bronze
FROM badges AS b
LEFT JOIN
(
    SELECT
        Id,
        DisplayName
    FROM users
    WHERE Id IN (
        SELECT UserId
        FROM badges
    )
) AS u ON b.UserId = u.Id
GROUP BY
    Day,
    b.UserId,
    u.DisplayName
```

这不仅加快了初始徽章数据插入的速度：

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 132.118 sec. Processed 323.43 million rows, 4.69 GB (2.45 million rows/s., 35.49 MB/s.)
Peak memory usage: 1.99 GiB.
```

但这也意味着未来的 badge 插入操作会更加高效：

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 0.583 sec.
```

在上述操作中，只为用户 ID `2936484` 从 `users` 表中检索到一行数据。该查询还通过表的排序键 `Id` 得到了优化。


## materialized view 与 UNION {#materialized-views-and-unions}

`UNION ALL` 查询通常用于将多个源表中的数据合并为一个结果集。

虽然增量materialized view 不直接支持 `UNION ALL`，但你可以通过为每个 `SELECT` 分支分别创建一个 materialized view，并将它们的结果写入同一个目标表来实现相同的效果。

在本示例中，我们将使用 Stack Overflow 数据集。请看下面的 `badges` 和 `comments` 表，它们分别表示用户获得的徽章以及他们在帖子上的评论：

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
```

可以使用以下 `INSERT INTO` 命令向其中写入数据：

```sql
INSERT INTO stackoverflow.badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')
INSERT INTO stackoverflow.comments SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/comments/*.parquet')
```

假设我们想创建一个统一的用户活动视图，通过将这两个表合并来展示每个用户的最后一次活动：

```sql
SELECT
 UserId,
 argMax(description, event_time) AS last_description,
 argMax(activity_type, event_time) AS activity_type,
    max(event_time) AS last_activity
FROM
(
    SELECT
 UserId,
 CreationDate AS event_time,
        Text AS description,
        'comment' AS activity_type
    FROM stackoverflow.comments
    UNION ALL
    SELECT
 UserId,
        Date AS event_time,
        Name AS description,
        'badge' AS activity_type
    FROM stackoverflow.badges
)
GROUP BY UserId
ORDER BY last_activity DESC
LIMIT 10
```

假设我们有一个目标表，用于接收此查询的结果。请注意这里使用了 [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) 表引擎和 [AggregateFunction](/sql-reference/data-types/aggregatefunction) 数据类型，以确保结果能够被正确合并：

```sql
CREATE TABLE user_activity
(
    `UserId` String,
    `last_description` AggregateFunction(argMax, String, DateTime64(3, 'UTC')),
    `activity_type` AggregateFunction(argMax, String, DateTime64(3, 'UTC')),
    `last_activity` SimpleAggregateFunction(max, DateTime64(3, 'UTC'))
)
ENGINE = AggregatingMergeTree
ORDER BY UserId
```

为了让在向 `badges` 或 `comments` 插入新行时这个表能够自动更新，一个比较直观的做法是尝试基于之前的 union 查询创建一个 materialized view：

```sql
CREATE MATERIALIZED VIEW user_activity_mv TO user_activity AS
SELECT
 UserId,
 argMaxState(description, event_time) AS last_description,
 argMaxState(activity_type, event_time) AS activity_type,
    max(event_time) AS last_activity
FROM
(
    SELECT
 UserId,
 CreationDate AS event_time,
        Text AS description,
        'comment' AS activity_type
    FROM stackoverflow.comments
    UNION ALL
    SELECT
 UserId,
        Date AS event_time,
        Name AS description,
        'badge' AS activity_type
    FROM stackoverflow.badges
)
GROUP BY UserId
ORDER BY last_activity DESC
```

虽然这在语法上是正确的，但会导致非预期的结果——该视图只会在向 `comments` 表插入数据时被触发。例如：


```sql
INSERT INTO comments VALUES (99999999, 23121, 1, 'The answer is 42', now(), 2936484, 'gingerwizard');

SELECT
 UserId,
 argMaxMerge(last_description) AS description,
 argMaxMerge(activity_type) AS activity_type,
    max(last_activity) AS last_activity
FROM user_activity
WHERE UserId = '2936484'
GROUP BY UserId

┌─UserId──┬─description──────┬─activity_type─┬───────────last_activity─┐
│ 2936484 │ The answer is 42 │ comment       │ 2025-04-15 09:56:19.000 │
└─────────┴──────────────────┴───────────────┴─────────────────────────┘

1 row in set. Elapsed: 0.005 sec.
```

向 `badges` 表插入数据不会触发该视图，从而 `user_activity` 不会收到更新：

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

SELECT
 UserId,
 argMaxMerge(last_description) AS description,
 argMaxMerge(activity_type) AS activity_type,
    max(last_activity) AS last_activity
FROM user_activity
WHERE UserId = '2936484'
GROUP BY UserId;

┌─UserId──┬─description──────┬─activity_type─┬───────────last_activity─┐
│ 2936484 │ The answer is 42 │ comment       │ 2025-04-15 09:56:19.000 │
└─────────┴──────────────────┴───────────────┴─────────────────────────┘

1 row in set. Elapsed: 0.005 sec.
```

为了解决这个问题，我们只需要为每个 SELECT 语句创建一个 materialized view：

```sql
DROP TABLE user_activity_mv;
TRUNCATE TABLE user_activity;

CREATE MATERIALIZED VIEW comment_activity_mv TO user_activity AS
SELECT
 UserId,
 argMaxState(Text, CreationDate) AS last_description,
 argMaxState('comment', CreationDate) AS activity_type,
    max(CreationDate) AS last_activity
FROM stackoverflow.comments
GROUP BY UserId;

CREATE MATERIALIZED VIEW badges_activity_mv TO user_activity AS
SELECT
 UserId,
 argMaxState(Name, Date) AS last_description,
 argMaxState('badge', Date) AS activity_type,
    max(Date) AS last_activity
FROM stackoverflow.badges
GROUP BY UserId;
```

现在向任一张表插入数据都会得到正确的结果。例如，向 `comments` 表插入数据：

```sql
INSERT INTO comments VALUES (99999999, 23121, 1, 'The answer is 42', now(), 2936484, 'gingerwizard');

SELECT
 UserId,
 argMaxMerge(last_description) AS description,
 argMaxMerge(activity_type) AS activity_type,
    max(last_activity) AS last_activity
FROM user_activity
WHERE UserId = '2936484'
GROUP BY UserId;

┌─UserId──┬─description──────┬─activity_type─┬───────────last_activity─┐
│ 2936484 │ The answer is 42 │ comment       │ 2025-04-15 10:18:47.000 │
└─────────┴──────────────────┴───────────────┴─────────────────────────┘

1 row in set. Elapsed: 0.006 sec.
```

同样，向 `badges` 表插入的数据会反映到 `user_activity` 表中：

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

SELECT
 UserId,
 argMaxMerge(last_description) AS description,
 argMaxMerge(activity_type) AS activity_type,
    max(last_activity) AS last_activity
FROM user_activity
WHERE UserId = '2936484'
GROUP BY UserId

┌─UserId──┬─description──┬─activity_type─┬───────────last_activity─┐
│ 2936484 │ gingerwizard │ badge         │ 2025-04-15 10:20:18.000 │
└─────────┴──────────────┴───────────────┴─────────────────────────┘

1 row in set. Elapsed: 0.006 sec.
```


## 并行处理 vs 顺序处理 {#materialized-views-parallel-vs-sequential}

如前面的示例所示，一张表可以作为多个 Materialized View 的数据源。它们的执行顺序取决于 [`parallel_view_processing`](/operations/settings/settings#parallel_view_processing) 这个设置项。

默认情况下，该设置项的值为 `0`（`false`），这意味着各个 Materialized View 会按照 `uuid` 顺序依次执行。

例如，考虑下面的 `source` 表和 3 个 Materialized View，每个都向同一个 `target` 表发送行数据：

```sql
CREATE TABLE source
(
    `message` String
)
ENGINE = MergeTree
ORDER BY tuple();

CREATE TABLE target
(
    `message` String,
    `from` String,
    `now` DateTime64(9),
    `sleep` UInt8
)
ENGINE = MergeTree
ORDER BY tuple();

CREATE MATERIALIZED VIEW mv_2 TO target
AS SELECT
    message,
    'mv2' AS from,
    now64(9) as now,
    sleep(1) as sleep
FROM source;

CREATE MATERIALIZED VIEW mv_3 TO target
AS SELECT
    message,
    'mv3' AS from,
    now64(9) as now,
    sleep(1) as sleep
FROM source;

CREATE MATERIALIZED VIEW mv_1 TO target
AS SELECT
    message,
    'mv1' AS from,
    now64(9) as now,
    sleep(1) as sleep
FROM source;
```

请注意，每个视图在向 `target` 表插入其行之前都会暂停 1 秒，并在插入的数据中包含其名称和插入时间。

向 `source` 表插入一行大约需要 3 秒，每个视图依次执行：

```sql
INSERT INTO source VALUES ('test')

1 row in set. Elapsed: 3.786 sec.
```

我们可以使用 `SELECT` 查询来确认各行是否已经到达：

```sql
SELECT
    message,
    from,
    now
FROM target
ORDER BY now ASC

┌─message─┬─from─┬───────────────────────────now─┐
│ test    │ mv3  │ 2025-04-15 14:52:01.306162309 │
│ test    │ mv1  │ 2025-04-15 14:52:02.307693521 │
│ test    │ mv2  │ 2025-04-15 14:52:03.309250283 │
└─────────┴──────┴───────────────────────────────┘

3 rows in set. Elapsed: 0.015 sec.
```

这与这些视图的 `uuid` 一一对应：

```sql
SELECT
    name,
 uuid
FROM system.tables
WHERE name IN ('mv_1', 'mv_2', 'mv_3')
ORDER BY uuid ASC

┌─name─┬─uuid─────────────────────────────────┐
│ mv_3 │ ba5e36d0-fa9e-4fe8-8f8c-bc4f72324111 │
│ mv_1 │ b961c3ac-5a0e-4117-ab71-baa585824d43 │
│ mv_2 │ e611cc31-70e5-499b-adcc-53fb12b109f5 │
└──────┴──────────────────────────────────────┘

3 rows in set. Elapsed: 0.004 sec.
```

相反，考虑在启用 `parallel_view_processing=1` 的情况下插入一行时会发生什么。启用该设置后，各个 VIEW 将并行执行，无法保证行到达目标表的顺序：

```sql
TRUNCATE target;
SET parallel_view_processing = 1;

INSERT INTO source VALUES ('test');

1 row in set. Elapsed: 1.588 sec.

SELECT
    message,
    from,
    now
FROM target
ORDER BY now ASC

┌─message─┬─from─┬───────────────────────────now─┐
│ test    │ mv3  │ 2025-04-15 19:47:32.242937372 │
│ test    │ mv1  │ 2025-04-15 19:47:32.243058183 │
│ test    │ mv2  │ 2025-04-15 19:47:32.337921800 │
└─────────┴──────┴───────────────────────────────┘

3 rows in set. Elapsed: 0.004 sec.
```


尽管在我们的示例中，来自每个 VIEW 的行的到达顺序是相同的，但这并无法得到保证——从各行插入时间的高度相近性就可以看出这一点。还请注意插入性能的提升。

### 何时使用并行处理 {#materialized-views-when-to-use-parallel}

启用 `parallel_view_processing=1` 可以显著提高插入吞吐量，如上所示，尤其是在单个表上附加了多个 materialized view 的情况下。不过，需要了解其中的权衡：

- **更高的插入压力**：所有 materialized view 会同时执行，从而增加 CPU 和内存使用。如果每个 view 都执行大量计算或 JOIN，这可能会使系统过载。
- **需要严格的执行顺序**：在某些罕见的工作流中，如果 view 的执行顺序很重要（例如存在链式依赖），并行执行可能会导致状态不一致或竞态条件。虽然可以通过设计规避这一点，但这类架构比较脆弱，并且可能在未来版本中失效。

:::note 历史默认值与稳定性
顺序执行在很长一段时间内是默认行为，部分原因是错误处理较为复杂。从历史上看，一个 materialized view 的失败可能会阻止其他 view 执行。新版本通过按数据块隔离失败改善了这一点，但顺序执行仍然提供了更清晰的失败语义。
:::

通常，在以下情况下启用 `parallel_view_processing=1`：

- 存在多个彼此独立的 materialized view
- 希望最大化插入性能
- 明确系统有能力处理并发的 view 执行

在以下情况下则应保持禁用：

- materialized view 之间存在依赖关系
- 需要可预测、有序的执行
- 正在调试或审计插入行为，并希望实现确定性的重放

## materialized view 和公用表表达式（CTE） {#materialized-views-common-table-expressions-ctes}

**非递归** 公用表表达式（CTE）在 materialized view 中受支持。

:::note 公用表表达式**不会**被物化
ClickHouse 不会物化 CTE；相反，它会将 CTE 的定义直接内联到查询中，如果某个 CTE 被多次使用，这可能会导致对同一表达式进行多次计算。
:::

来看下面这个示例，它为每种帖子类型计算每日活动量。

```sql
CREATE TABLE daily_post_activity
(
    Day Date,
 PostType String,
 PostsCreated SimpleAggregateFunction(sum, UInt64),
 AvgScore AggregateFunction(avg, Int32),
 TotalViews SimpleAggregateFunction(sum, UInt64)
)
ENGINE = AggregatingMergeTree
ORDER BY (Day, PostType);

CREATE MATERIALIZED VIEW daily_post_activity_mv TO daily_post_activity AS
WITH filtered_posts AS (
    SELECT
 toDate(CreationDate) AS Day,
 PostTypeId,
 Score,
 ViewCount
    FROM posts
    WHERE Score > 0 AND PostTypeId IN (1, 2)  -- Question or Answer
)
SELECT
    Day,
    CASE PostTypeId
        WHEN 1 THEN 'Question'
        WHEN 2 THEN 'Answer'
    END AS PostType,
    count() AS PostsCreated,
    avgState(Score) AS AvgScore,
    sum(ViewCount) AS TotalViews
FROM filtered_posts
GROUP BY Day, PostTypeId;
```

虽然在这里严格来说并不需要使用 CTE，不过为了示例说明，该视图仍会按预期工作：

```sql
INSERT INTO posts
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
```

```sql
SELECT
    Day,
    PostType,
    avgMerge(AvgScore) AS AvgScore,
    sum(PostsCreated) AS PostsCreated,
    sum(TotalViews) AS TotalViews
FROM daily_post_activity
GROUP BY
    Day,
    PostType
ORDER BY Day DESC
LIMIT 10

┌────────Day─┬─PostType─┬───────────AvgScore─┬─PostsCreated─┬─TotalViews─┐
│ 2024-03-31 │ Question │ 1.3317757009345794 │          214 │       9728 │
│ 2024-03-31 │ Answer   │ 1.4747191011235956 │          356 │          0 │
│ 2024-03-30 │ Answer   │ 1.4587912087912087 │          364 │          0 │
│ 2024-03-30 │ Question │ 1.2748815165876777 │          211 │       9606 │
│ 2024-03-29 │ Question │ 1.2641509433962264 │          318 │      14552 │
│ 2024-03-29 │ Answer   │ 1.4706927175843694 │          563 │          0 │
│ 2024-03-28 │ Answer   │  1.601637107776262 │          733 │          0 │
│ 2024-03-28 │ Question │ 1.3530864197530865 │          405 │      24564 │
│ 2024-03-27 │ Question │ 1.3225806451612903 │          434 │      21346 │
│ 2024-03-27 │ Answer   │ 1.4907539118065434 │          703 │          0 │
└────────────┴──────────┴────────────────────┴──────────────┴────────────┘

10 rows in set. Elapsed: 0.013 sec. Processed 11.45 thousand rows, 663.87 KB (866.53 thousand rows/s., 50.26 MB/s.)
Peak memory usage: 989.53 KiB.
```

在 ClickHouse 中，CTE 会被内联展开，这意味着在优化阶段它们实际上会被复制粘贴到查询中，而**不会**被物化。这意味着：

* 如果你的 CTE 引用的表与源表不同（即 materialized view 所附加的那个表），并且在 `JOIN` 或 `IN` 子句中使用，它的行为会类似于子查询或联接，而不是触发器。
* materialized view 仍然只会在向主源表插入数据时被触发，但 CTE 会在每次插入时重新执行，这可能会导致不必要的开销，尤其是在被引用的表很大的情况下。

例如，


```sql
WITH recent_users AS (
  SELECT Id FROM stackoverflow.users WHERE CreationDate > now() - INTERVAL 7 DAY
)
SELECT * FROM stackoverflow.posts WHERE OwnerUserId IN (SELECT Id FROM recent_users)
```

在这种情况下，`users` CTE 会在每次向 `posts` 插入数据时重新计算，而当有新用户插入时，materialized view 不会更新——它只会在向 `posts` 插入数据时才会更新。

通常，应将 CTE 用于作用在与 materialized view 所附加的同一源表上的逻辑，或者确保被引用的表较小且不太可能导致性能瓶颈。或者，考虑采用[与 materialized view 中 JOIN 相同的优化策略](/materialized-view/incremental-materialized-view#join-best-practices)。
