---
'slug': '/materialized-view/incremental-materialized-view'
'title': '增量物化视图'
'description': '如何使用增量物化视图来加速查询'
'keywords':
- 'incremental materialized views'
- 'speed up queries'
- 'query optimization'
'score': 10000
---

import materializedViewDiagram from '@site/static/images/materialized-view/materialized-view-diagram.png';
import Image from '@theme/IdealImage';

## 背景 {#background}

增量物化视图（Materialized Views）允许用户将计算成本从查询时转移到插入时，从而加快 `SELECT` 查询的速度。

与像 Postgres 这样的事务性数据库不同，ClickHouse 的物化视图只是一个触发器，在数据块插入表时运行查询。该查询的结果被插入到第二个“目标”表中。如果更多行被插入，结果将再次发送到目标表，在那里，中间结果将被更新和合并。这个合并的结果相当于在所有原始数据上运行该查询。

物化视图的主要动机是插入到目标表中的结果代表对行的聚合、过滤或转换的结果。这些结果通常是原始数据的较小表示（在聚合的情况下是部分草图）。这一点，加上从目标表读取结果的查询简单，确保查询时间比在原始数据上执行相同计算时快，将计算（因此查询延迟）从查询时间转移到插入时间。

ClickHouse 中的物化视图会在数据流入其基础表时实时更新，运作方式更类似于持续更新的索引。这与其他数据库形成对比，在其他数据库中，物化视图通常是查询的静态快照，必须刷新（类似于 ClickHouse 的 [可刷新物化视图](/sql-reference/statements/create/view#refreshable-materialized-view)）。

<Image img={materializedViewDiagram} size="md" alt="物化视图图"/>

## 示例 {#example}

作为示例，我们将使用在 ["模式设计"](/data-modeling/schema-design) 中记录的 Stack Overflow 数据集。

假设我们想要获取每个帖子的每日点赞和点踩数。

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

由于 [`toStartOfDay`](/sql-reference/functions/date-time-functions#tostartofday) 函数的存在，这在 ClickHouse 中是一个相当简单的查询：

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

这个查询由于 ClickHouse 的性能已经很快了，但我们能不能做得更好？

如果我们想在插入时间使用物化视图来计算这个，我们需要一个表来接收结果。该表应仅保留每日 1 行。如果接收到对现有日期的更新，则应将其他列合并到现有日期的行中。为了实现这种增量状态的合并，必须为其他列存储部分状态。

这在 ClickHouse 中需要一种特殊的引擎类型：[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)。它将所有具有相同排序键的行替换为一行，该行包含数值列的汇总值。以下表将合并任何具有相同日期的行，汇总任何数值列：

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

为了演示我们的物化视图，假设我们的投票表是空的，尚未接收任何数据。我们的物化视图在插入到 `votes` 中的数据上执行上述 `SELECT`，将结果发送到 `up_down_votes_per_day`：

```sql
CREATE MATERIALIZED VIEW up_down_votes_per_day_mv TO up_down_votes_per_day AS
SELECT toStartOfDay(CreationDate)::Date AS Day,
       countIf(VoteTypeId = 2) AS UpVotes,
       countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY Day
```

这里的 `TO` 子句是关键，指明结果将发送到的地方，即 `up_down_votes_per_day`。

我们可以从之前的插入中重新填充我们的投票表：

```sql
INSERT INTO votes SELECT toUInt32(Id) AS Id, toInt32(PostId) AS PostId, VoteTypeId, CreationDate, UserId, BountyAmount
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/*.parquet')

0 rows in set. Elapsed: 111.964 sec. Processed 477.97 million rows, 3.89 GB (4.27 million rows/s., 34.71 MB/s.)
Peak memory usage: 283.49 MiB.
```

完成后，我们可以确认我们的 `up_down_votes_per_day` 的大小 – 我们应该有每个日期 1 行：

```sql
SELECT count()
FROM up_down_votes_per_day
FINAL

┌─count()─┐
│    5723 │
└─────────┘
```

通过存储查询的结果，我们将行数从 2.38 亿（在 `votes` 中）有效减少到 5000。然而，关键在于，如果新的投票被插入到 `votes` 表中，新的值将被发送到 `up_down_votes_per_day` 的相应日期，并将异步在后台自动合并 – 保持每个日期仅一行。`up_down_votes_per_day` 因此将始终保持小且最新。

由于行的合并是异步的，当用户查询时，某天可能会有不止一条投票。为了确保任何未合并的行在查询时间被合并，我们有两个选项：

- 在表名上使用 `FINAL` 修饰符。我们在上面的计数查询中做了这个。
- 按照我们最终表中使用的排序键进行聚合，即 `CreationDate` 并汇总指标。通常，这种方法更高效且灵活（该表可以用于其他用途），但前者对于某些查询可能更简单。我们在下面展示了两者：

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

这样将我们的查询从 0.133s 提速到 0.004s – 超过 25 倍的提升！

:::important 重要提示: `ORDER BY` = `GROUP BY`
在大多数情况下，物化视图转换的 `GROUP BY` 子句中使用的列，应该与目标表中使用的 `ORDER BY` 子句保持一致，如果使用 `SummingMergeTree` 或 `AggregatingMergeTree` 表引擎。这些引擎依赖于 `ORDER BY` 列在后台合并操作中合并具有相同值的行。`GROUP BY` 和 `ORDER BY` 列之间的不对齐可能导致查询性能低效、合并不理想，甚至数据不一致。
:::

### 更复杂的示例 {#a-more-complex-example}

上述示例使用物化视图来计算并维护每日的两个总和。总和表示维护部分状态的最简单聚合形式 - 当新值到达时，我们只需将其加到现有值上。然而，ClickHouse 的物化视图可以用于任何聚合类型。

假设我们希望为每一天计算一些帖子的统计数据：`Score` 的 99.9 百分位数和 `CommentCount` 的平均值。计算这个的查询可能如下所示：

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

与之前一样，我们可以创建一个物化视图，该视图在我们向 `posts` 表中插入新帖子时执行上述查询。

为了举例说明，并为了避免从 S3 加载帖子数据，我们将创建一个与 `posts` 具有相同模式的重复表 `posts_null`。然而，这个表不会存储任何数据，仅在插入行时被物化视图使用。为了防止数据存储，我们可以使用 [`Null` 表引擎类型](/engines/table-engines/special/null)。

```sql
CREATE TABLE posts_null AS posts ENGINE = Null
```

Null 表引擎是一种强大的优化 - 可以把它看作是 `/dev/null`。我们的物化视图将在 `posts_null` 表接收行时计算并存储我们的摘要统计信息 - 它只是一个触发器。然而，原始数据不会被存储。在我们的情况下，我们可能仍然想存储原始帖子，但此方法可以在避免存储原始数据的开销的同时计算聚合。

因此，物化视图变为：

```sql
CREATE MATERIALIZED VIEW post_stats_mv TO post_stats_per_day AS
       SELECT toStartOfDay(CreationDate) AS Day,
       quantileState(0.999)(Score) AS Score_quantiles,
       avgState(CommentCount) AS AvgCommentCount
FROM posts_null
GROUP BY Day
```

请注意，我们在聚合函数的末尾附加了后缀 `State`。这确保了返回函数的聚合状态，而不是最终结果。它将包含额外信息，以允许此部分状态与其他状态合并。例如，在平均情况下，这将包括列的计数和总和。

> 部分聚合状态对于计算正确结果是必要的。例如，为了计算平均值，仅仅对子范围的平均值进行平均会产生不正确的结果。

我们现在创建这个视图的目标表 `post_stats_per_day`，它存储这些部分聚合状态：

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

虽然之前的 `SummingMergeTree` 足以存储计数，但对于其他函数，我们需要更高级的引擎类型：[`AggregatingMergeTree`](/engines/table-engines/mergetree-family/aggregatingmergetree)。为了确保 ClickHouse 知道将存储聚合状态，我们定义 `Score_quantiles` 和 `AvgCommentCount` 为 `AggregateFunction` 类型，指定部分状态的函数源及其源列的类型。与 `SummingMergeTree` 一样，具有相同 `ORDER BY` 键值的行将被合并（在上述示例中为 `Day`）。

要通过我们的物化视图填充 `post_stats_per_day`，我们可以简单地将所有行从 `posts` 插入到 `posts_null`：

```sql
INSERT INTO posts_null SELECT * FROM posts

0 rows in set. Elapsed: 13.329 sec. Processed 119.64 million rows, 76.99 GB (8.98 million rows/s., 5.78 GB/s.)
```

> 在生产中，您可能会将物化视图附加到 `posts` 表。我们在这里使用 `posts_null` 来演示空表。

我们的最终查询需要为我们的函数使用 `Merge` 后缀（因为列存储部分聚合状态）：

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

请注意，我们在这里使用 `GROUP BY` 而不使用 `FINAL`。

## 其他应用 {#other-applications}

以上主要关注如何使用物化视图增量更新数据的部分聚合，从而将计算从查询时间转移到插入时间。除了这种常见用例外，物化视图还有其他多种应用。

### 过滤和转换 {#filtering-and-transformation}

在某些情况下，我们可能希望在插入时仅插入某些行和列。在这种情况下，我们的 `posts_null` 表可以接收插入，使用 `SELECT` 查询在插入到 `posts` 表前过滤行。例如，假设我们希望转换 `posts` 表中的 `Tags` 列。该列包含以管道分隔的标签名称列表。通过将这些转换为数组，我们可以更方便地按单独的标签值进行聚合。

> 我们可以在执行 `INSERT INTO SELECT` 时进行此转换。物化视图允许我们将此逻辑封装在 ClickHouse DDL 中，并保持我们的 `INSERT` 简单，对新行应用转换。

我们的物化视图用于此转换如下所示：

```sql
CREATE MATERIALIZED VIEW posts_mv TO posts AS
        SELECT * EXCEPT Tags, arrayFilter(t -> (t != ''), splitByChar('|', Tags)) as Tags FROM posts_null
```

### 查找表 {#lookup-table}

用户在选择 ClickHouse 排序键时应考虑其访问模式。频繁出现在过滤和聚合子句中的列应被使用。这对于访问模式更多样化、无法用一组列封装的场景可能会造成一定限制。例如，考虑以下 `comments` 表：

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

这里的排序键优化该表以支持按 `PostId` 的查询过滤。

假设用户希望按特定的 `UserId` 进行过滤，并计算他们的平均 `Score`：

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

虽然快速（对 ClickHouse 来说数据很小），但我们可以看到这需要从处理的行数来看进行全表扫描 - 9038 万。对于更大的数据集，我们可以使用物化视图来查找排序键值 `PostId` 以过滤列 `UserId`。然后可以使用这些值进行高效查找。

在这个示例中，我们的物化视图可以非常简单，仅在插入时从 `comments` 选择 `PostId` 和 `UserId`。这些结果被发送到一个名为 `comments_posts_users` 的表，该表按 `UserId` 排序。我们在下面创建 `Comments` 表的空版本，并使用此表填充我们的视图和 `comments_posts_users` 表：

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

我们可以在子查询中使用此视图以加速我们之前的查询：

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

### 链接 {#chaining}

物化视图可以串联使用，使复杂的工作流程得以建立。要获取实际示例，我们建议阅读这个 [博客文章](https://clickhouse.com/blog/chaining-materialized-views)。

## 物化视图和 JOINs {#materialized-views-and-joins}

:::note 可刷新物化视图
以下仅适用于增量物化视图。可刷新物化视图会在全目标数据集上定期执行其查询，并完全支持 JOIN。考虑在可以容忍结果新鲜度降低的情况下使用它们进行复杂的 JOIN。
:::

ClickHouse 中的增量物化视图完全支持 `JOIN` 操作，但有一个关键限制：**物化视图仅在源表（查询中的最左侧表）插入时触发。** 在 JOIN 中的右侧表即使其数据发生变化也不会触发更新。当构建 **增量** 物化视图时，这种行为特别重要，因为数据在插入时被聚合或转换。

当使用 `JOIN` 定义增量物化视图时，`SELECT` 查询中的最左表行为为源。当新行插入到该表时，ClickHouse *仅* 使用这些新插入的行执行物化视图查询。在此执行期间，JOIN 中的右侧表的所有数据被完全读取，但对此表的更改不会触发视图。

这种行为使得物化视图中的 JOIN 类似于对静态维度数据的快照连接。

这对于将数据与参考或维度表进行丰富化非常有效。然而，任何对右侧表的更新（例如，用户元数据）将不会回溯更新物化视图。要查看更新的数据，必须在源表中插入新的行。

### 示例 {#materialized-views-and-joins-example}

让我们通过使用 [Stack Overflow 数据集](/data-modeling/schema-design) 来逐步了解一个具体示例。我们将使用物化视图计算**每个用户的每日徽章**，包括来自 `users` 表的用户显示名称。

作为提醒，我们的表结构如下：

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

我们假设我们的 `users` 表已经填充：

```sql
INSERT INTO users
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/users.parquet');
```

物化视图及其关联的目标表定义如下：

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

:::note 分组和排序对齐
物化视图中的 `GROUP BY` 子句必须包括 `DisplayName`、`UserId` 和 `Day` 以匹配 `SummingMergeTree` 目标表中的 `ORDER BY`。这确保行被正确聚合和合并。遗漏任何这些都会导致不正确的结果或低效的合并。
:::

如果我们现在填充徽章，视图将被触发 - 填充我们的 `daily_badges_by_user` 表。

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 433.762 sec. Processed 1.16 billion rows, 28.50 GB (2.67 million rows/s., 65.70 MB/s.)
```

假设我们希望查看特定用户获得的徽章，我们可以编写以下查询：

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

现在，如果该用户获得一个新徽章并插入一行，我们的视图将会更新：

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
请注意此处插入的延迟。插入的用户行将与整 个 `users` 表连接，显著影响插入性能。我们在以下 [“在过滤和连接中使用源表”](/materialized-view/incremental-materialized-view#using-source-table-in-filters-and-joins-in-materialized-views) 中提出解决方法。
:::

相反，如果我们为新用户插入徽章，然后插入用户的行，我们的物化视图将无法捕获用户的指标。

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

在这种情况下，视图仅在徽章插入时执行，而用户行不存在。如果我们再次为该用户插入徽章，则会插入一行，如预期：

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

然而，请注意这个结果是不正确的。

### 物化视图中 JOIN 的最佳实践 {#join-best-practices}

- **使用最左侧表作为触发器。** 仅 `SELECT` 语句左侧的表会触发物化视图。右侧表的更改不会触发更新。

- **预插入连接的数据。** 确保连接表中的数据在将行插入源表之前已经存在。JOIN 在插入时进行评估，因此丢失的数据将导致不匹配的行或空值。

- **限制从连接中提取的列。** 仅选择连接表中所需的列，以最小化内存使用并减少插入时延迟（见下文）。

- **评估插入时性能。** JOIN 增加插入成本，特别是当右侧表很大时。使用代表生产数据的基准进行插入速率的基准测试。

- **对于简单查找更优先使用字典。** 使用 [字典](/dictionary) 进行键值查找（例如，用户 ID 到姓名）以避免代价高昂的 JOIN 操作。

- **对齐 `GROUP BY` 和 `ORDER BY` 以提高合并效率。** 当使用 `SummingMergeTree` 或 `AggregatingMergeTree` 时，确保 `GROUP BY` 与目标表中的 `ORDER BY` 子句匹配，以允许高效的行合并。

- **使用显式的列别名。** 当表具有重叠的列名时，使用别名以防止歧义并确保目标表中的结果正确。

- **考虑插入量和频率。** 在适中的插入负载情况下，JOIN 表现较好。对于高吞吐量的摄入，考虑使用暂存表、预连接或其他方法，如字典和 [可刷新物化视图](/materialized-view/refreshable-materialized-view)。

### 在过滤和连接中使用源表 {#using-source-table-in-filters-and-joins-in-materialized-views}

在 ClickHouse 中使用物化视图时，了解在物化视图查询执行期间源表的处理方式是很重要的。具体而言，物化视图查询中的源表被插入的数据块替换。这种行为如果未被正确理解，可能导致一些意想不到的结果。

#### 示例场景 {#example-scenario}

考虑以下设置：

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

#### 解释 {#explanation}

在上述示例中，我们有两个物化视图 `mvw1` 和 `mvw2`，它们执行相似的操作，但在引用源表 `t0` 的方式上略有不同。

在 `mvw1` 中，表 `t0` 在 JOIN 的右侧的 `(SELECT * FROM t0)` 子查询中被直接引用。当数据插入到 `t0` 时，物化视图的查询使用插入的数据块替换 `t0` 执行。这意味着 JOIN 操作仅在新插入的行上执行，而不是在整个表上。

在与 `vt0` 连接的第二种情况下，视图从 `t0` 中读取所有数据。这确保了 JOIN 操作考虑了 `t0` 中的所有行，而不仅仅是新插入的数据块。

关键差异在于 ClickHouse 如何处理物化视图查询中的源表。当物化视图因插入而触发时，源表（在这里是 `t0`）被插入的数据块替换。这种行为可以用于查询优化，但也需要谨慎处理，以避免意外结果。

### 用例及注意事项 {#use-cases-and-caveats}

在实践中，您可以利用此行为来优化只需处理源表数据子集的物化视图。例如，您可以使用子查询在将源表与其他表连接之前过滤源表。这可以帮助减少物化视图处理的数据量并提高性能。

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

在这个示例中，从 `IN (SELECT id FROM t0)` 子查询构建的集合仅包含新插入的行，可以帮助针对其过滤 `t1`。

#### Stack Overflow 示例 {#example-with-stack-overflow}

考虑我们之前的物化视图示例，以计算 **每个用户的每日徽章**，包括来自 `users` 表的用户显示名称。

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

此视图对 `badges` 表的插入延迟产生了显著影响，例如：

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 7.517 sec.
```

利用上述方法，我们可以优化此视图。我们将通过插入徽章行中的用户 ID 来向 `users` 表添加过滤：

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

这样一来，不仅加速了初始徽章插入：

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 132.118 sec. Processed 323.43 million rows, 4.69 GB (2.45 million rows/s., 35.49 MB/s.)
Peak memory usage: 1.99 GiB.
```

还确保未来的徽章插入也高效：

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 0.583 sec.
```

在上述操作中，仅为用户 ID `2936484` 从用户表中检索了一行。此查找也通过 `Id` 的表排序键进行了优化。

## 物化视图和联合 {#materialized-views-and-unions}

`UNION ALL` 查询通常用于将来自多个源表的数据合并为一个结果集。

虽然增量物化视图不直接支持 `UNION ALL`，但是可以通过为每个 `SELECT` 分支创建一个单独的物化视图并将其结果写入一个共享的目标表来实现相同的结果。

在我们的示例中，我们将使用 Stack Overflow 数据集。考虑以下 `badges` 和 `comments` 表，它们分别表示用户获得的徽章和他们对帖子的评论：

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

可以使用以下 `INSERT INTO` 命令填充这些表：

```sql
INSERT INTO stackoverflow.badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')
INSERT INTO stackoverflow.comments SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/comments/*.parquet')
```

假设我们想创建一个用户活动的统一视图，显示每个用户的最后活动，通过合并这两个表：

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

假设我们有一个目标表来接收该查询的结果。请注意使用了 [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) 表引擎和 [AggregateFunction](/sql-reference/data-types/aggregatefunction)，以确保结果正确合并：

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

希望此表在对 `badges` 或 `comments` 插入新行时更新，解决此问题的简单方法可能是尝试使用先前的联合查询创建一个物化视图：

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

虽然在语法上是有效的，但它会产生意外的结果 - 该视图只会触发对 `comments` 表的插入。例如：

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

对 `badges` 表的插入将不会触发视图更新，导致 `user_activity` 不会接收更新：

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

为了解决这个问题，我们只需为每个 SELECT 语句创建一个物化视图：

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

现在，无论插入到哪个表都将得到正确的结果。例如，如果我们插入到 `comments` 表：

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

同样，插入 `badges` 表的操作也会反映在 `user_activity` 表中：

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

## 并行与顺序处理 {#materialized-views-parallel-vs-sequential}

如前例所示，一个表可以作为多个物化视图的源。它们的执行顺序取决于设置 [`parallel_view_processing`](/operations/settings/settings#parallel_view_processing)。

默认情况下，此设置等于 `0` (`false`)，这意味着物化视图按 `uuid` 顺序顺序执行。

例如，考虑以下 `source` 表和 3 个物化视图，每个视图向一个 `target` 表发送行：

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

请注意，每个视图在将其行插入到 `target` 表之前延迟 1 秒，同时还包括其名称和插入时间。

将行插入到表 `source` 需要约 3 秒，每个视图依次执行：

```sql
INSERT INTO source VALUES ('test')

1 row in set. Elapsed: 3.786 sec.
```

我们可以通过 `SELECT` 确认来自每一行的信息：

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

这与视图的 `uuid` 对齐：

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

相反，考虑如果启用 `parallel_view_processing=1` 时会发生什么。在启用此选项时，视图并行执行，不保证行到达目标表的顺序：

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

尽管我们从每个视图到达行的顺序是相同的，但这并不是保证的 - 正如每行的插入时间相似所示。此外还要注意插入性能的提高。

### 何时使用并行处理 {#materialized-views-when-to-use-parallel}

启用 `parallel_view_processing=1` 可以显著提高插入吞吐量，尤其是当多个物化视图附加到同一表时，如上所示。然而，了解权衡是很重要的：

- **增加插入压力**：所有物化视图同时执行，增加了 CPU 和内存使用。如果每个视图执行沉重的计算或 JOIN，这可能会导致系统过载。
- **需要严格的执行顺序**：在某些少见的工作流程中，如果视图执行顺序很重要（例如，链式依赖），并行执行可能会导致不一致状态或竞争条件。虽然可以设计解决此问题，但这种设置是脆弱的，可能会在未来版本中失效。

:::note 历史默认值和稳定性
顺序执行长期以来一直是默认选项，部分原因是错误处理的复杂性。在历史上，一个物化视图中的失败可能会阻止其他视图执行。较新版本通过对每个块隔离故障来改善这一点，但顺序执行仍提供了更清晰的故障语义。
:::

一般来说，当：

- 您有多个独立的物化视图
- 您的目标是最大化插入性能
- 您了解系统的处理并发视图执行的容量时，可以启用 `parallel_view_processing=1`。

当：

- 物化视图之间存在依赖关系时
- 您要求可预测、有序的执行
- 您正在调试或审计插入行为并希望进行确定性重放时，请禁用此选项。

## 物化视图和公共表表达式 (CTE) {#materialized-views-common-table-expressions-ctes}

**非递归** 公共表表达式 (CTE) 在物化视图中受支持。

:::note 公共表表达式 **不是** 被物化
ClickHouse 不会物化 CTE；相反，它会直接将 CTE 定义替换到查询中，这可能导致相同表达式的多次评估（如果 CTE 被多次使用）。
:::

考虑以下示例，该示例计算每种帖子类型的每日活动。

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

虽然 CTE 在这里严格来说是不必要的，但为了示例目的，视图会按预期工作：

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

在 ClickHouse 中，CTE 被内联，这意味着它们在优化期间会有效地被复制到查询中，**而不** 是被物化。这意味着：

- 如果您的 CTE 引用与源表（即物化视图附加到的表）不同的表，并且在 `JOIN` 或 `IN` 子句中使用，它将表现得像子查询或连接，而不是触发器。
- 物化视图仍然仅在主要源表插入时触发，但 CTE 会在每次插入时重新执行，这可能导致不必要的开销，特别是当引用的表很大时。

例如，

```sql
WITH recent_users AS (
  SELECT Id FROM stackoverflow.users WHERE CreationDate > now() - INTERVAL 7 DAY
)
SELECT * FROM stackoverflow.posts WHERE OwnerUserId IN (SELECT Id FROM recent_users)
```

在该情况下，用户 CTE 会在每次插入到帖子时重新评估，而物化视图不会在新用户插入时更新 - 仅在帖子时更新。

一般来说，对于在物化视图附加的源表上操作的逻辑使用 CTE，或者确保引用的表很小且不太可能导致性能瓶颈。或者，考虑 [与物化视图的 JOIN 相同的优化](/materialized-view/incremental-materialized-view#join-best-practices)。
