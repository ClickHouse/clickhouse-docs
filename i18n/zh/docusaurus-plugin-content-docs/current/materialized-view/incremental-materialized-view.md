---
'slug': '/materialized-view/incremental-materialized-view'
'title': '增量物化视图'
'description': '如何使用增量物化视图来加快查询速度'
'keywords':
- 'incremental materialized views'
- 'speed up queries'
- 'query optimization'
'score': 10000
'doc_type': 'guide'
---

import materializedViewDiagram from '@site/static/images/materialized-view/materialized-view-diagram.png';
import Image from '@theme/IdealImage';

## 背景 {#background}

增量物化视图（Materialized Views）允许用户将计算成本从查询时间转移到插入时间，从而加快 `SELECT` 查询的速度。

与事务性数据库（如 Postgres）不同，ClickHouse 的物化视图只是一个触发器，当数据块插入到表中时，会运行一个查询。该查询的结果将插入到第二个“目标”表中。如果插入更多行，结果将再次发送到目标表，其中中间结果将被更新和合并。这个合并后的结果相当于对所有原始数据运行查询。

物化视图的主要动机是插入到目标表中的结果代表对行进行聚合、过滤或转换的结果。这些结果通常是原始数据的较小表示（在聚合的情况下是部分快照）。这种方法确保读取目标表结果的查询简单，从而确保查询时间比对原始数据执行相同计算时要快，将计算（因此查询延迟）从查询时间转移到插入时间。

ClickHouse 中的物化视图会在数据流入其基础表时实时更新，功能更像是不断更新的索引。这与其他数据库形成对比，在这些数据库中，物化视图通常是必须被刷新的查询的静态快照（类似于 ClickHouse 的 [可刷新的物化视图](/sql-reference/statements/create/view#refreshable-materialized-view)）。

<Image img={materializedViewDiagram} size="md" alt="物化视图示意图"/>

## 示例 {#example}

作为示例，我们将使用在 ["模式设计"](/data-modeling/schema-design) 中文档化的 Stack Overflow 数据集。

假设我们想要获取每篇帖子的每天点赞和点踩数。

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

得益于 [`toStartOfDay`](/sql-reference/functions/date-time-functions#toStartOfDay) 函数，这在 ClickHouse 中是一个相当简单的查询：

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

这个查询在 ClickHouse 中已经很快，但我们能做到更好吗？

如果我们想在插入时间通过物化视图计算这个，我们需要一个表来接收结果。这个表应该只保留每天 1 行。如果收到现有日期的更新，其他列应该合并到现有日期的行中。为了让这些增量状态合并，必须为其他列存储部分状态。

这需要 ClickHouse 中一种特殊的引擎类型：[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)。它将所有具有相同排序键的行替换为一行，其中包含数字列的总和。以下表格会合并任何具有相同日期的行，求和任何数值列：

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

为了演示我们的物化视图，假设我们的投票表是空的，尚未接收到任何数据。我们的物化视图会对插入到 `votes` 中的数据执行上述 `SELECT`，结果发送到 `up_down_votes_per_day`：

```sql
CREATE MATERIALIZED VIEW up_down_votes_per_day_mv TO up_down_votes_per_day AS
SELECT toStartOfDay(CreationDate)::Date AS Day,
       countIf(VoteTypeId = 2) AS UpVotes,
       countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY Day
```

`TO` 子句在这里是关键，表示结果将发送到 `up_down_votes_per_day`。

我们可以从早先的插入中重新填充我们的投票表：

```sql
INSERT INTO votes SELECT toUInt32(Id) AS Id, toInt32(PostId) AS PostId, VoteTypeId, CreationDate, UserId, BountyAmount
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/*.parquet')

0 rows in set. Elapsed: 111.964 sec. Processed 477.97 million rows, 3.89 GB (4.27 million rows/s., 34.71 MB/s.)
Peak memory usage: 283.49 MiB.
```

完成后，我们可以确认 `up_down_votes_per_day` 的大小 - 每天应有 1 行：

```sql
SELECT count()
FROM up_down_votes_per_day
FINAL

┌─count()─┐
│    5723 │
└─────────┘
```

我们已经有效地将这里的行数从 2.38 亿（在 `votes` 中）减少到 5000，存储了查询的结果。然而，关键是如果新的投票插入到 `votes` 表中，新值将被发送到 `up_down_votes_per_day` 的相应日期，并将在后台异步自动合并 - 只保留每天的一行。因此，`up_down_votes_per_day` 始终保持小且最新。

由于行的合并是异步的，当用户查询时，可能会出现每天多个投票。为了确保在查询时合并任何未完成的行，我们有两个选项：

- 在表名上使用 `FINAL` 修饰符。我们为上面的计数查询使用了此方法。
- 按照我们最终表中使用的排序键进行聚合，即 `CreationDate` 及对度量进行求和。通常，这样更有效且灵活（该表可以用于其他用途），但前者对于某些查询可能更简单。我们下面展示了两者：

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

这使我们查询的时间从 0.133s 加速到 0.004s – 提高了超过 25 倍的性能！

:::important 重要提示: `ORDER BY` = `GROUP BY`
在大多数情况下，物化视图转换中的 `GROUP BY` 子句使用的列应与目标表的 `ORDER BY` 子句中使用的列一致，特别是在使用 `SummingMergeTree` 或 `AggregatingMergeTree` 表引擎时。这些引擎依赖 `ORDER BY` 列在后台合并操作时合并具有相同值的行。`GROUP BY` 和 `ORDER BY` 列的不匹配可能导致查询性能低效、合并不佳，甚至数据不一致。
:::

### 更复杂的示例 {#a-more-complex-example}

上面的示例使用物化视图来计算和维护每天的两个总和。总和是维护部分状态的最简单聚合形式 - 当新值到来时，我们可以简单地将其添加到现有值中。然而，ClickHouse 的物化视图可以用于任何聚合类型。

假设我们希望计算每一天的帖子统计信息：`Score` 的 99.9 百分位数和 `CommentCount` 的平均值。计算此内容的查询可能如下所示：

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

与之前一样，我们可以创建一个物化视图，在新的帖子插入到我们的 `posts` 表时执行上述查询。

为了示例并避免从 S3 加载帖子数据，我们将创建一个与 `posts` 具有相同模式的重复表 `posts_null`。然而，此表不会存储任何数据，仅在插入行时被物化视图使用。为了防止存储数据，我们可以使用 [`Null` 表引擎类型](/engines/table-engines/special/null)。

```sql
CREATE TABLE posts_null AS posts ENGINE = Null
```

Null 表引擎是一种强大的优化 - 把它看作是 `/dev/null`。我们的物化视图将在我们的 `posts_null` 表在插入时接收行时计算并存储我们的摘要统计信息 - 它只是一个触发器。然而，原始数据将不会被存储。虽然在这种情况下，我们可能仍希望存储原始帖子，但这种方法可以在避免原始数据存储开销的同时计算聚合。

因此，物化视图变为：

```sql
CREATE MATERIALIZED VIEW post_stats_mv TO post_stats_per_day AS
       SELECT toStartOfDay(CreationDate) AS Day,
       quantileState(0.999)(Score) AS Score_quantiles,
       avgState(CommentCount) AS AvgCommentCount
FROM posts_null
GROUP BY Day
```

请注意，我们在聚合函数的末尾附加了后缀 `State`。这确保返回聚合函数的聚合状态，而不是最终结果。这将包含额外信息，允许该部分状态与其他状态合并。例如，在平均值的情况下，这将包括计数和列的总和。

> 部分聚合状态是计算正确结果所必须的。例如，在计算平均值时，仅仅对范围的平均值求平均会导致错误的结果。

我们现在为此视图创建目标表 `post_stats_per_day`，该表存储这些部分聚合状态：

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

虽然之前的 `SummingMergeTree` 足以存储计数，但对于其他函数我们需要更高级的引擎类型：[`AggregatingMergeTree`](/engines/table-engines/mergetree-family/aggregatingmergetree)。为了确保 ClickHouse 知道将存储聚合状态，我们将 `Score_quantiles` 和 `AvgCommentCount` 定义为 `AggregateFunction` 类型，指定部分状态的函数来源及其源列的类型。与 `SummingMergeTree` 一样，具有相同 `ORDER BY` 键值的行将被合并（在上述示例中为 `Day`）。

要通过我们的物化视图填充 `post_stats_per_day`，我们只需将 `posts` 中的所有行插入到 `posts_null` 中：

```sql
INSERT INTO posts_null SELECT * FROM posts

0 rows in set. Elapsed: 13.329 sec. Processed 119.64 million rows, 76.99 GB (8.98 million rows/s., 5.78 GB/s.)
```

> 在生产中，您可能会将物化视图附加到 `posts` 表。我们这里使用 `posts_null` 是为了演示空表。

我们的最终查询需要使用 `Merge` 后缀来表示我们的函数（因为列存储部分聚合状态）：

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

请注意，我们在这里使用了 `GROUP BY` 而不是使用 `FINAL`。

## 其他应用 {#other-applications}

上述主要着重于利用物化视图增量更新数据的部分聚合，从而将计算从查询转移到插入时间。除了这个常见用例外，物化视图还有许多其他应用。

### 过滤和转换 {#filtering-and-transformation}

在某些情况下，我们可能希望在插入时仅插入行和列的子集。在这种情况下，我们的 `posts_null` 表可以接收插入，使用一个 `SELECT` 查询在插入到 `posts` 表之前过滤行。例如，假设我们希望转换 `posts` 表中的 `Tags` 列。它包含以管道分隔的标签名称列表。通过将其转换为数组，我们可以更容易地按单个标签值进行聚合。

> 我们可以在运行 `INSERT INTO SELECT` 时执行此转换。物化视图允许我们在 ClickHouse DDL 中封装此逻辑，并保持我们的 `INSERT` 简单，将转换应用于任何新行。

我们的物化视图用于此转换如下所示：

```sql
CREATE MATERIALIZED VIEW posts_mv TO posts AS
        SELECT * EXCEPT Tags, arrayFilter(t -> (t != ''), splitByChar('|', Tags)) as Tags FROM posts_null
```

### 查找表 {#lookup-table}

用户在选择 ClickHouse 排序键时应考虑其访问模式。应使用在过滤和聚合子句中频繁使用的列。这在用户具有更不一样的访问模式，无法封装在一组列中时可能会有限制。例如，考虑以下的 `comments` 表：

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

此处的排序键优化了按 `PostId` 过滤的查询。

假设用户希望过滤特定的 `UserId` 并计算其平均 `Score`：

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

虽然速度很快（对于 ClickHouse 来说数据很小），但从处理的行数可以看出，这需要进行全表扫描 - 9038 万。对于更大的数据集，我们可以使用物化视图查找我们的排序键值 `PostId` 来过滤列 `UserId`。然后可以使用这些值来执行有效的查找。

在这个示例中，我们的物化视图可以非常简单，仅在插入时选择 `comments` 中的 `PostId` 和 `UserId`。这些结果反过来会发送到一个按 `UserId` 排序的表 `comments_posts_users`。我们在下面创建 `Comments` 表的空版本，并利用它来填充我们的视图和 `comments_posts_users` 表：

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

我们现在可以在子查询中使用这个视图来加速我们之前的查询：

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

### 链接 / 级联物化视图 {#chaining}

物化视图可以链式（或级联）使用，允许建立复杂的工作流。
更多信息，请参见指南 ["级联物化视图"](https://clickhouse.com/docs/guides/developer/cascading-materialized-views)。

## 物化视图和 JOIN {#materialized-views-and-joins}

:::note 可刷新的物化视图
以下内容仅适用于增量物化视图。可刷新的物化视图定期对完整目标数据集执行其查询，并完全支持 JOIN。如果可以容忍结果新鲜度的降低，请考虑在复杂 JOIN 中使用它们。
:::

ClickHouse 中的增量物化视图完全支持 `JOIN` 操作，但有一个关键限制：**物化视图仅在源表（查询中最左侧的表）插入时触发。** JOIN 中的右侧表不会触发更新，即使它们的数据发生变化。在构建 **增量** 物化视图时，这种行为尤为重要，因为数据是在插入时被聚合或转换的。

当使用 `JOIN` 定义增量物化视图时，`SELECT` 查询中的最左侧表作为源。当向此表插入新行时，ClickHouse *仅* 用这些新插入的行执行物化视图查询。JOIN 中的右侧表在此执行期间被完整读取，但对它们的更改单独不会触发视图。

这种行为使得物化视图中的 JOIN 与对静态维度数据的快照连接类似。

这非常适合用引用或维度表来丰富数据。然而，对右侧表（例如用户元数据）的任何更新将不会追溯性地更新物化视图。要查看更新的数据，必须在源表中到达新插入数据。

### 示例 {#materialized-views-and-joins-example}

让我们用 [Stack Overflow 数据集](/data-modeling/schema-design) 走过一个具体的示例。我们将使用物化视图计算 **每个用户的每日徽章**，包括来自 `users` 表的用户显示名称。

提醒一下，我们的表模式是：

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

我们假设 `users` 表已预填充：

```sql
INSERT INTO users
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/users.parquet');
```

物化视图及其关联目标表的定义如下：

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
物化视图中的 `GROUP BY` 子句必须包括 `DisplayName`、`UserId` 和 `Day`，以匹配 `SummingMergeTree` 目标表中的 `ORDER BY`。这确保了行被正确聚合和合并。遗漏其中任何一项可能导致结果不正确或合并效率低下。
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

现在，如果该用户获得了新徽章并插入了一行，我们的视图将被更新：

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
注意此处插入的延迟。插入的用户行与整个 `users` 表连接，显著影响插入性能。我们在下面的 ["在过滤和连接中使用源表"](/materialized-view/incremental-materialized-view#using-source-table-in-filters-and-joins-in-materialized-views) 中提出了一些解决方法。
:::

相反，如果我们为新用户插入徽章，然后插入该用户的行，我们的物化视图将无法捕获用户的指标。

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

在这种情况下，该视图仅在徽章插入时执行，而在用户行存在之前执行。如果我们再为该用户插入一个徽章，将插入一行，符合预期：

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

但请注意，该结果是错误的。

### 物化视图中 JOIN 的最佳实践 {#join-best-practices}

- **将最左侧表用作触发器。** 只有 `SELECT` 语句左侧的表会触发物化视图。右侧表的更改不会触发更新。

- **预插入连接的数据。** 确保在将行插入源表之前，连接表中的数据存在。JOIN 在插入时求值，因此缺失数据将导致不匹配的行或 null。

- **限制从连接中提取的列。** 仅选择连接表中所需的列，以最小化内存使用和减少插入时延迟（见下）。

- **评估插入时性能。** JOIN 会增加插入成本，特别是在右侧表很大的情况下。使用代表性的生产数据基准测试插入速率。

- **简单查找时优先选择字典。** 使用 [字典](/dictionary) 进行键值查找（例如，用户 ID 到名称）以避免昂贵的 JOIN 操作。

- **对齐 `GROUP BY ` 和 `ORDER BY ` 以提高合并效率。** 使用 `SummingMergeTree` 或 `AggregatingMergeTree` 时，确保 `GROUP BY` 与目标表中的 `ORDER BY` 子句匹配，以允许有效的行合并。

- **使用显式列别名。** 当表具有重叠的列名称时，使用别名以防止歧义，并确保在目标表中得到正确结果。

- **考虑插入量和频率。** 在适度插入负载的情况下，JOIN 效果良好。对于高吞吐量数据的摄取，考虑使用暂存表、预连接或其他方法，如字典和 [可刷新的物化视图](/materialized-view/refreshable-materialized-view)。

### 在过滤和连接中使用源表 {#using-source-table-in-filters-and-joins-in-materialized-views}

在 ClickHouse 中使用物化视图时，重要的是要理解在物化视图查询执行期间源表是如何被处理的。特别是，物化视图查询中的源表会被插入的数据块替换。如果不理解这种行为，可能会导致一些意外的结果。

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

在上述示例中，我们有两个物化视图 `mvw1` 和 `mvw2`，它们执行类似的操作，但在引用源表 `t0` 的方式上有细微差别。

在 `mvw1` 中，表 `t0` 直接在 JOIN 的右侧的 `(SELECT * FROM t0)` 子查询中引用。当数据插入 `t0` 中时，物化视图的查询将使用插入的数据块执行，该数据块替换了 `t0`。这意味着 JOIN 操作仅在新插入的行上进行，而不是在整个表上。

在第二种情况下，连接 `vt0` 时，视图读取 `t0` 中的所有数据。这确保了 JOIN 操作考虑 `t0` 中的所有行，而不仅仅是新插入的数据块。

关键的区别在于 ClickHouse 如何处理物化视图查询中的源表。当物化视图因插入而触发时，源表（在本例中为 `t0`）被插入的数据块替换。可以利用这种行为来优化查询，但也需要仔细考虑以避免意外结果。

### 用例和注意事项 {#use-cases-and-caveats}

在实践中，您可以利用此行为优化仅需处理源表数据子集的物化视图。例如，您可以使用子查询在将源表与其他表连接之前过滤源表。这可以帮助减少物化视图处理的数据量，并提高性能。

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

在此示例中，由 `IN (SELECT id FROM t0)` 子查询构建的集合仅包含新插入的行，这可以帮助过滤 `t1`。

#### 与 Stack Overflow 的示例 {#example-with-stack-overflow}

考虑我们之前的物化视图示例 (/materialized-view/incremental-materialized-view#example) 以计算 **每个用户的每日徽章**，包括来自 `users` 表的用户显示名称。

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

这个视图对 `badges` 表的插入延迟产生了显著影响，例如：

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 7.517 sec.
```

使用上述方法，我们可以优化此视图。我们将使用插入徽章行中的用户 ID 对 `users` 表进行过滤：

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

这不仅加快了初始徽章插入：

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 132.118 sec. Processed 323.43 million rows, 4.69 GB (2.45 million rows/s., 35.49 MB/s.)
Peak memory usage: 1.99 GiB.
```

而且还意味着未来的徽章插入也很高效：

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 0.583 sec.
```

在上述操作中，仅为用户 ID `2936484` 从用户表检索了一行。这个查找也通过 `Id` 的表排序键进行了优化。

## 物化视图和联合 {#materialized-views-and-unions}

`UNION ALL` 查询通常用于将多个源表的数据组合到单个结果集中。

虽然增量物化视图不直接支持 `UNION ALL`，但您可以通过为每个 `SELECT` 分支创建一个单独的物化视图并将其结果写入共享目标表来实现相同的结果。

作为例子，我们将使用 Stack Overflow 数据集。考虑以下的 `badges` 和 `comments` 表，分别表示用户获得的徽章以及他们对帖子所做的评论：

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

这些可以通过以下 `INSERT INTO` 命令填充：

```sql
INSERT INTO stackoverflow.badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')
INSERT INTO stackoverflow.comments SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/comments/*.parquet')
```

假设我们希望创建一个用户活动的统一视图，显示每个用户的最后活动，通过组合这两个表：

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

假设我们有一个目标表来接收此查询的结果。注意使用 [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) 表引擎和 [AggregateFunction](/sql-reference/data-types/aggregatefunction) 以确保结果正确合并：

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

希望这个表在向 `badges` 或 `comments` 中插入新行时更新，简单的方法可能是尝试根据前面的联合查询创建一个物化视图：

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

虽然这在语法上是有效的，但会产生意想不到的结果 - 视图仅会触发对 `comments` 表的插入。例如：

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

对 `badges` 表的插入将不会触发视图，导致 `user_activity` 无法接收更新：

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

现在向任一表插入新行都会产生正确的结果。例如，如果我们向 `comments` 表中插入：

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

同样，对 `badges` 表的插入也会在 `user_activity` 表中反映出来：

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

## 并行与串行处理 {#materialized-views-parallel-vs-sequential}

如前一示例所示，表可以作为多个物化视图的源。执行这些视图的顺序取决于设置 [`parallel_view_processing`](/operations/settings/settings#parallel_view_processing)。

默认情况下，该设置等于 `0`（`false`），意味着物化视图按 `uuid` 顺序顺序执行。

例如，考虑以下 `source` 表和 3 个物化视图，每个视图将行发送到一个 `target` 表：

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

请注意，每个视图在将其行插入目标表之前会暂停 1 秒，同时还附加了它们的名称和插入时间。

向 `source` 表插入一行需时约 3 秒，每个视图顺序执行：

```sql
INSERT INTO source VALUES ('test')

1 row in set. Elapsed: 3.786 sec.
```

我们可以通过 `SELECT` 确认每行的到达：

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

这与视图的 `uuid` 一致：

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

相反，考虑如果插入一行并启用 `parallel_view_processing=1` 后会发生什么。在启用此项时，视图并行执行，因此不会保证行到达目标表的顺序：

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

尽管我们从每个视图到达行的顺序相同，但这并不保证 - 如每行的插入时间相似所示。另外请注意，插入性能有所提高。

### 何时使用并行处理 {#materialized-views-when-to-use-parallel}

启用 `parallel_view_processing=1` 可以显著提高插入吞吐量，如上所示，特别是在多个物化视图附加到单个表时。然而，理解其权衡非常重要：

- **增加插入压力**：所有物化视图同时执行，增加CPU和内存使用。如果每个视图执行大量计算或 JOIN，这可能超载系统。
- **需要严格的执行顺序**：在视图执行顺序很重要的少数工作流中（例如，链式依赖），并行执行可能导致不一致状态或竞争条件。虽然有可能在这方面进行设计，但这种设置较为脆弱，可能随未来版本破坏。

:::note 历史默认设置与稳定性
顺序执行长期以来是默认设置，部分原因是错误处理的复杂性。历史上，单个物化视图的故障可能阻止其他物化视图的执行。新版本通过对每个数据块隔离故障来改善这一点，但顺序执行仍提供了更清晰的故障语义。
:::

一般而言，在以下情况下启用 `parallel_view_processing=1`：

- 您拥有多个独立的物化视图
- 您希望最大化插入性能
- 您意识到系统能够处理并发视图执行的能力

在以下情况下禁用它：
- 物化视图相互依赖
- 您需要可预测的、有序执行
- 您正在调试或审计插入行为，需要确定性回放

## 物化视图和公共表表达式（CTE） {#materialized-views-common-table-expressions-ctes}

**非递归** 公共表表达式（CTE）在物化视图中得到支持。

:::note 公共表表达式 **不是** 物化的
ClickHouse 不会物化 CTE；而是直接将 CTE 定义替换为查询中，这可能导致对相同表达式的多次评估（如果 CTE 被多次使用）。
:::

考虑以下示例，它计算每种帖子类型的每日活动。

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

虽然这里严格没有必要使用 CTE，但作为示例，视图按预期工作：

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

在 ClickHouse 中，CTE 是内联的，这意味着它们在优化时有效地被复制粘贴到查询中，而 **不** 进行物化。这意味着：

- 如果您的 CTE 引用的表与物化视图附加的源表不同（即，该物化视图附加到的表），并在 `JOIN` 或 `IN` 子句中使用，它将表现得像子查询或连接，而不是触发器。
- 物化视图仍然仅在主源表插入时触发，但 CTE 将在每次插入时重新执行，这可能导致不必要的开销，尤其是如果引用的表很大的话。

例如，

```sql
WITH recent_users AS (
  SELECT Id FROM stackoverflow.users WHERE CreationDate > now() - INTERVAL 7 DAY
)
SELECT * FROM stackoverflow.posts WHERE OwnerUserId IN (SELECT Id FROM recent_users)
```

在此情况下，`users` CTE 在每次插入 `posts` 时都会重新评估，并且物化视图在插入新用户时不会更新 - 仅在插入帖子时才会更新。

一般来说，使用 CTE 处理与物化视图附加到的同一源表的数据，或者确保引用的表很小且不太可能导致性能瓶颈。或者，考虑 [物化视图 JOIN 的相同优化](/materialized-view/incremental-materialized-view#join-best-practices)。
