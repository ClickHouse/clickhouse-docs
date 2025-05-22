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

增量物化视图（Materialized Views）使用户能够将计算成本从查询时间转移到插入时间，从而加快 `SELECT` 查询的速度。

与 Postgres 等事务性数据库不同，在 ClickHouse 中，物化视图仅仅是一个触发器，在数据块插入到表中时执行查询。该查询的结果插入到第二个“目标”表中。如果插入更多行，结果将再次发送到目标表，更新和合并中间结果。这个合并的结果相当于对所有原始数据执行查询。

物化视图的主要动力在于插入到目标表的结果代表了对行的聚合、过滤或转换的结果。这些结果通常会是原始数据的更小表示（在聚合的情况下是部分快照）。这一点，以及从目标表读取结果的查询变得简单，确保了查询时间比对原始数据执行相同计算时更快，从而将计算（及其查询延迟）从查询时间转移到插入时间。

在 ClickHouse 中，物化视图随着数据流入其基础表而实时更新，更像是不断更新的索引。这与其他数据库形成对比，通常物化视图是查询的静态快照，需要刷新（类似于 ClickHouse [可刷新物化视图](/sql-reference/statements/create/view#refreshable-materialized-view)）。

<Image img={materializedViewDiagram} size="md" alt="物化视图图"/>

## 示例 {#example}

为了示例用途，我们将使用在 ["模式设计"](/data-modeling/schema-design) 中记录的 Stack Overflow 数据集。

假设我们想获得每一篇帖子每天的点赞和点踩数。

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

在 ClickHouse 中，由于 [`toStartOfDay`](/sql-reference/functions/date-time-functions#tostartofday) 函数，这个查询相对简单：

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

这个查询在 ClickHouse 上已经很快，但是我们能做得更好吗？

如果我们希望使用物化视图在插入时间计算这一点，我们需要一个表来接收结果。这个表应该仅保留每一天的 1 行。如果收到更新为一个已有日期，则其他列应该合并到现有日期的行中。为了使逐步状态的合并发生，必须存储其他列的部分状态。

这在 ClickHouse 中需要一种特殊的引擎类型：[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)。该引擎用一行合并所有具有相同排序键的行，并包含数值列的总和。以下表将合并具有相同日期的行，累计所有数值列：

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

为了演示我们的物化视图，假设我们的投票表是空的，尚未接收到任何数据。我们的物化视图在插入新数据到 `votes` 时执行上述 `SELECT`，并将结果发送到 `up_down_votes_per_day`：

```sql
CREATE MATERIALIZED VIEW up_down_votes_per_day_mv TO up_down_votes_per_day AS
SELECT toStartOfDay(CreationDate)::Date AS Day,
       countIf(VoteTypeId = 2) AS UpVotes,
       countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY Day
```

此处的 `TO` 子句是关键，表示结果将发送到 `up_down_votes_per_day`。

我们可以从之前的插入中重新填充我们的投票表：

```sql
INSERT INTO votes SELECT toUInt32(Id) AS Id, toInt32(PostId) AS PostId, VoteTypeId, CreationDate, UserId, BountyAmount
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/*.parquet')

0 rows in set. Elapsed: 111.964 sec. Processed 477.97 million rows, 3.89 GB (4.27 million rows/s., 34.71 MB/s.)
Peak memory usage: 283.49 MiB.
```

完成后，我们可以确认我们的 `up_down_votes_per_day` 的行数——我们应该每一天有 1 行：

```sql
SELECT count()
FROM up_down_votes_per_day
FINAL

┌─count()─┐
│    5723 │
└─────────┘
```

通过存储查询结果，我们有效地将行数从 2.38 亿（在 `votes` 中）减少到 5000。然而，关键在于如果新投票插入到 `votes` 表中，新值将发送到 `up_down_votes_per_day`，在其各自的日期中将自动在后台异步合并，保留每天只有一行。因此，`up_down_votes_per_day` 将始终保持小且最新。

由于行的合并是异步的，用户查询时可能每天会有多于一票。为了确保在查询时合并任何未完成的行，我们有两个选择：

- 在表名上使用 `FINAL` 修饰符。我们在上述计数查询中进行了此操作。
- 按照用于我们最终表的排序键进行聚合，即 `CreationDate`，并对度量进行求和。通常，后者更有效和灵活（表可以用于其他目的），但是前者对于某些查询可能更简单。我们在下面展示了这两种方式：

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

这使我们查询的速度从 0.133 秒提高到 0.004 秒——超过 25 倍的改进！

:::important 重要提示: `ORDER BY` = `GROUP BY`
在大多数情况下，物化视图转换中使用的 `GROUP BY` 子句中的列，应与目标表中使用的 `ORDER BY` 子句一致，如果使用 `SummingMergeTree` 或 `AggregatingMergeTree` 表引擎。这些引擎依赖于 `ORDER BY` 列在后台合并操作期间合并具有相同值的行。`GROUP BY` 和 `ORDER BY` 列之间的不对齐可能导致查询性能低效、合并不理想，甚至数据不一致。
:::

### 更复杂的示例 {#a-more-complex-example}

上述示例使用物化视图来计算和维护每天的两个汇总。汇总代表了维护部分状态的最简单聚合形式——我们只需将新值添加到到现有值即可。然而，ClickHouse 物化视图可以用于任何聚合类型。

假设我们希望每日计算每篇帖子的某些统计信息：`Score` 的 99.9 百分位数和 `CommentCount` 的平均值。计算这个的查询可能如下：

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

同样，我们可以创建一个物化视图，在新的帖子插入我们的 `posts` 表时执行上述查询。

为了示例的目的，为了避免从 S3 中加载帖子数据，我们将创建一个与 `posts` 具有相同架构的重复表 `posts_null`。然而，这个表将不存储任何数据，仅在行插入时被物化视图使用。为避免数据存储，我们可以使用 [`Null` 表引擎类型](/engines/table-engines/special/null)。

```sql
CREATE TABLE posts_null AS posts ENGINE = Null
```

空表引擎是一种强大的优化——可以将其视为 `/dev/null`。当 `posts_null` 表在插入时接收到行时，我们的物化视图将计算并存储我们的汇总统计——这只是一个触发器。然而，原始数据不会被存储。虽然在我们的案例中，我们可能仍然希望存储原始帖子，这种方法可以在避免存储原始数据开销的同时计算聚合。

因此，物化视图如下所示：

```sql
CREATE MATERIALIZED VIEW post_stats_mv TO post_stats_per_day AS
       SELECT toStartOfDay(CreationDate) AS Day,
       quantileState(0.999)(Score) AS Score_quantiles,
       avgState(CommentCount) AS AvgCommentCount
FROM posts_null
GROUP BY Day
```

注意，我们在聚合函数的结尾处附加后缀 `State`。这确保返回函数的聚合状态，而不是最终结果。这将包含额外的信息以允许此部分状态与其他状态合并。例如，在平均数的情况下，这将包括列的计数和总和。

> 部分聚合状态是计算正确结果所必需的。例如，对于计算平均数，仅仅对子范围的平均数进行求平均会产生不正确的结果。

现在，我们为这个视图创建目标表 `post_stats_per_day`，以存储这些部分聚合状态：

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

虽然之前的 `SummingMergeTree` 足以存储计数，但我们需要一种更高级的引擎类型来处理其他函数：[`AggregatingMergeTree`](/engines/table-engines/mergetree-family/aggregatingmergetree)。
为了确保 ClickHouse 知道将存储聚合状态，我们将 `Score_quantiles` 和 `AvgCommentCount` 定义为类型 `AggregateFunction`，指定聚合状态的函数源和对应列的类型。与 `SummingMergeTree` 类似，具有相同 `ORDER BY` 键值的行将合并（在上述示例中为 `Day`）。

通过物化视图填充我们的 `post_stats_per_day`，我们可以简单地将所有行从 `posts` 插入 `posts_null`：

```sql
INSERT INTO posts_null SELECT * FROM posts

0 rows in set. Elapsed: 13.329 sec. Processed 119.64 million rows, 76.99 GB (8.98 million rows/s., 5.78 GB/s.)
```

> 在生产中，您可能会将物化视图附加到 `posts` 表。我们在此使用 `posts_null` 是为了演示空表。

我们的最终查询需要使用我们函数的 `Merge` 后缀（由于列存储部分聚合状态）：

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

请注意，我们在此处使用了 `GROUP BY` 而不是使用 `FINAL`。

## 其他应用 {#other-applications}

以上主要关注于使用物化视图按增量更新数据的部分聚合，从而将计算从查询时间移至插入时间。除了这个常见用例，物化视图还有许多其他应用。

### 过滤和转换 {#filtering-and-transformation}

在某些情况下，我们可能希望在插入时仅插入行和列的子集。在这种情况下，我们的 `posts_null` 表可以接收插入，使用 `SELECT` 查询在插入到 `posts` 表之前对行进行过滤。例如，假设我们希望转换 `posts` 表中的 `Tags` 列。它包含以管道分隔的标签名称列表。通过将这些转换为数组，我们可以更容易按单个标签值进行聚合。

> 我们可以在执行 `INSERT INTO SELECT` 时执行此转换。物化视图使我们能够将此逻辑封装在 ClickHouse DDL 中，并保持我们的 `INSERT` 简单，转换应用于任何新行。

我们的物化视图用于该转换如下所示：

```sql
CREATE MATERIALIZED VIEW posts_mv TO posts AS
        SELECT * EXCEPT Tags, arrayFilter(t -> (t != ''), splitByChar('|', Tags)) as Tags FROM posts_null
```

### 查找表 {#lookup-table}

用户在选择 ClickHouse 排序键时应考虑他们的访问模式。应使用在过滤和聚合子句中经常使用的列。这对于用户在一个单一的列集合中无法概括的更复杂的访问模式的场景是有限制的。例如，考虑以下 `comments` 表：

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

此排序键优化了按 `PostId` 过滤的查询。

假设用户希望按特定的 `UserId` 进行过滤并计算其平均 `Score`：

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

虽然迅速（在 ClickHouse 中数据量小），但我们可以从处理的行数看出这需要对整个表进行扫描——9038万次。对于较大数据集，我们可以使用物化视图查找 `UserId` 的过滤列中的 `PostId`。这些值可以用于执行高效查找。

在此示例中，我们的物化视图可以非常简单，仅在插入时从 `comments` 中选择 `PostId` 和 `UserId`。这些结果随后被发送到一个按 `UserId` 排序的表 `comments_posts_users`。我们在下面创建 `Comments` 表的空版本，并用此填充我们的视图和 `comments_posts_users` 表：

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

现在，我们可以在子查询中使用这个视图，以加速我们之前的查询：

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

物化视图可以链接，从而建立复杂的工作流。对于实际示例，我们建议阅读这篇 [博客文章](https://clickhouse.com/blog/chaining-materialized-views)。

## 物化视图与 JOIN {#materialized-views-and-joins}

:::note 可刷新物化视图
以下内容仅适用于增量物化视图。可刷新物化视图定期对完整目标数据集执行其查询，并完全支持 JOIN。如果可以容忍结果新鲜度的降低，请考虑在复杂 JOIN 中使用它们。
:::

ClickHouse 中的增量物化视图完全支持 `JOIN` 操作，但有一个关键限制：**物化视图仅在插入到源表（查询中的最左侧表）时触发。** 在 JOIN 中的右侧表不触发更新，即使它们的数据发生变化。这种行为在建立**增量**物化视图时尤其重要，其中数据在插入时被聚合或转换。

当使用 `JOIN` 定义增量物化视图时，`SELECT` 查询中的最左侧表作为源。当往这个表插入新行时，ClickHouse *仅* 用这些新插入的行执行物化视图查询。JOIN 中的右侧表在执行期间被完全读取，但单独对它们的更改不会触发视图。

这种行为使物化视图中的 JOIN 类似于针对静态维度数据的快照 JOIN。

这在使用引用或维度表丰富数据时效果很好。然而，对右侧表的任何更新（如用户元数据）不会追溯更新物化视图。要查看更新的数据，必须在源表中插入新数据。

### 示例 {#materialized-views-and-joins-example}

让我们通过使用 [Stack Overflow 数据集](/data-modeling/schema-design) 来走过一个具体示例。我们将使用物化视图来计算 **每用户的每日徽章**，包括用户表中的显示名称。

作为提醒，我们的表结构是：

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

我们假设我们的 `users` 表已预填充：

```sql
INSERT INTO users
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/users.parquet');
```

物化视图及其相关联的目标表定义如下：

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
物化视图中的 `GROUP BY` 子句必须包括 `DisplayName`、`UserId` 和 `Day` 以匹配 `SummingMergeTree` 目标表中的 `ORDER BY`。这确保了行被正确聚合和合并。省略其中任何一个可能导致不正确的结果或低效的合并。
:::

如果我们现在填充徽章，视图将被触发——填充我们的 `daily_badges_by_user` 表。

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 433.762 sec. Processed 1.16 billion rows, 28.50 GB (2.67 million rows/s., 65.70 MB/s.)
```

假设我们希望查看特定用户获得的徽章，我们可以写出以下查询：

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

现在，如果该用户获得新徽章并插入一行，视图将被更新：

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
注意此处插入的延迟。插入的用户行与整个 `users` 表进行 JOIN，显著影响插入性能。我们在下面的 ["在物化视图的过滤和 JOIN 中使用源表"](/materialized-view/incremental-materialized-view#using-source-table-in-filters-and-joins-in-materialized-views) 中提议了应对策略。
:::

相反，如果我们为新用户插入徽章，然后再插入用户的行，物化视图将无法捕获用户的指标。

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

在此案例中，视图仅在徽章插入时执行，而在用户行存在之前。如果我们为用户插入另一枚徽章，则插入一行，这是预期的：

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

但是请注意，这个结果是不正确的。

### 物化视图中 JOIN 的最佳实践 {#join-best-practices}

- **使用最左侧表作为触发器。** 只有在 `SELECT` 语句左侧的表会触发物化视图。对右侧表的更改不会触发更新。

- **预插入连接数据。** 确保在将行插入源表之前，连接表中的数据存在。JOIN 在插入时被评估，因此缺失数据将导致未匹配的行或空值。

- **限制从连接中提取的列。** 仅选择连接表中所需的列，以最小化内存使用并减小插入时间延迟（见下文）。

- **评估插入时间性能。** JOIN 增加了插入的成本，尤其是与大型右侧表的情况。使用具有代表性的生产数据对插入速率进行基准测试。

- **简单查找时优先使用字典。** 使用 [字典](/dictionary) 进行键值查找（例如，将用户 ID 映射到名称），以避免费用高昂的 JOIN 操作。

- **对齐 `GROUP BY` 和 `ORDER BY` 以提高合并效率。** 使用 `SummingMergeTree` 或 `AggregatingMergeTree` 时，确保 `GROUP BY` 与目标表中的 `ORDER BY` 子句匹配，以允许有效的行合并。

- **使用显式列别名。** 当表具有重叠列名时，使用别名以防止歧义并确保目标表中的结果正确。

- **考虑插入量和频率。** JOIN 在适度插入工作负载中效果较好。对于高吞吐量的引入，考虑使用暂存表、预连接或其他方法，如字典和 [可刷新物化视图](/materialized-view/refreshable-materialized-view)。

### 在物化视图的过滤和 JOIN 中使用源表 {#using-source-table-in-filters-and-joins-in-materialized-views}

在 ClickHouse 中使用物化视图时，了解源表在物化视图的查询执行过程中如何被处理非常重要。具体来说，物化视图查询中的源表将被插入的数据块替换。这种行为可能会导致一些意外结果，如果没有正确理解。

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

在上述示例中，我们有两个物化视图 `mvw1` 和 `mvw2`，它们执行类似的操作，但在如何引用源表 `t0` 上有些不同。

在 `mvw1` 中，表 `t0` 在 JOIN 右侧的 `(SELECT * FROM t0)` 子查询中被直接引用。当数据插入到 `t0` 中时，物化视图的查询将使用插入的数据块替换 `t0` 执行。这意味着 JOIN 操作仅在新插入的行上进行，而不是在整个表上。

在与 `vt0` 连接的第二种情况下，视图从 `t0` 读取所有数据。这确保 JOIN 操作考虑到 `t0` 中的所有行，而不仅仅是新插入的数据块。

关键区别在于 ClickHouse 如何处理物化视图查询中的源表。当通过插入触发物化视图时，源表（在本例中为 `t0`）被插入的数据块替换。这种行为可以优化查询，但也需要谨慎考虑，以避免意外结果。

### 用例和注意事项 {#use-cases-and-caveats}

实际上，您可以使用这种行为优化仅需处理源表数据子集的物化视图。例如，您可以使用子查询来过滤源表，然后将其与其他表连接。这可以帮助减少物化视图处理的数据量并改善性能。

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

在这个例子中，使用 `IN (SELECT id FROM t0)` 子查询构建的集合仅包含新插入的行，这可以帮助在对比中过滤 `t1`。

#### 使用 Stack Overflow 示例 {#example-with-stack-overflow}

考虑我们之前的物化视图示例，用于计算 **每用户的每日徽章**，包括来自 `users` 表的用户显示名称。

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

此视图显著影响了 `badges` 表上的插入延迟，例如：

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 7.517 sec.
```

使用上述方法，我们可以优化这个视图。我们将在插入徽章的行中使用用户 ID，对 `users` 表添加过滤：

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

不仅可以加速初始徽章插入：

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 132.118 sec. Processed 323.43 million rows, 4.69 GB (2.45 million rows/s., 35.49 MB/s.)
Peak memory usage: 1.99 GiB.
```

还可以使未来徽章插入保持高效：

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 0.583 sec.
```

在上述操作中，仅从 users 表检索用户 ID 为 `2936484` 的一行。此查找也经过了 `Id` 的表排序键优化。

## 物化视图与 UNION {#materialized-views-and-unions}

`UNION ALL` 查询通常用于将来自多个源表的数据合并到单个结果集中。

虽然增量物化视图中不直接支持 `UNION ALL`，但您可以通过为每个 `SELECT` 分支创建单独的物化视图，将它们的结果写入共享目标表，来实现相同的结果。

对于我们的示例，我们将使用 Stack Overflow 数据集。考虑以下 `badges` 和 `comments` 表，这两者分别代表用户获得的徽章和他们在帖子上所做的评论：

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

这些可以使用以下 `INSERT INTO` 命令填充：

```sql
INSERT INTO stackoverflow.badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')
INSERT INTO stackoverflow.comments SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/comments/*.parquet')
```

假设我们想要创建一个统一的用户活动视图，通过将这两个表合并显示每个用户的最后一次活动：

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

假设我们有一个目标表，接收此查询的结果。请注意使用 [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) 表引擎和 [AggregateFunction](/sql-reference/data-types/aggregatefunction) 来确保结果正确合并：

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

希望这个表在新行插入到 `badges` 或 `comments` 中时更新，一个幼稚的解决方案可能是尝试创建具有上一个 UNION 查询的物化视图：

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

虽然这在语法上有效，但会产生意外结果——视图将仅触发对 `comments` 表的插入。例如：

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

对 `badges` 表的插入将不会触发视图更新，导致 `user_activity` 不会收到更新：

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

现在，向任一表插入数据都会导致结果正确。例如，如果我们向 `comments` 表插入：

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

同样，对 `badges` 表的插入也会反映在 `user_activity` 表中：

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

如前所述，表可以作为多个物化视图的源。这些视图的执行顺序取决于设置 [`parallel_view_processing`](/operations/settings/settings#parallel_view_processing)。

默认情况下，此设置等于 `0`（`false`），这意味着物化视图按 `uuid` 顺序顺序执行。

例如，考虑以下 `source` 表和三个物化视图，每个视图向一个 `target` 表发送行：

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

请注意，每个视图在将其行插入 `target` 表之前暂停 1 秒，同时包括它们的名称和插入时间。

向 `source` 表插入一行需要 ~3 秒，每个视图顺序执行：

```sql
INSERT INTO source VALUES ('test')

1 row in set. Elapsed: 3.786 sec.
```

我们可以通过 `SELECT` 确认从每个行到达的情况：

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

相反，考虑在启用 `parallel_view_processing=1` 时插入一行会发生什么。在启用此选项时，视图会并行执行，因此无法保证行到达目标表的顺序：

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

尽管每个视图到达的行的顺序相同，但这并不保证——如各行的插入时间相似所示。还要注意插入性能已得到改善。

### 何时使用并行处理 {#materialized-views-when-to-use-parallel}

启用 `parallel_view_processing=1` 可以显著提高插入吞吐量，如上所示，尤其是当多个物化视图附加到单个表时。然而，了解权衡是很重要的：

- **增加插入压力**：所有物化视图同时执行，增加 CPU 和内存使用。如果每个视图执行重计算或 JOIN，这可能会造成系统超负荷。
- **需要严格的执行顺序**：在某些罕见的工作流中，视图执行的顺序非常重要（例如，链式依赖），并行执行可能导致状态不一致或竞争条件。虽然可以设计来绕过这个问题，但这种设置是脆弱的，可能会在未来的版本中失效。

:::note 历史默认值和稳定性
顺序执行曾经是很长时间以来的默认设置，部分原因是由于错误处理的复杂性。历史上，一个物化视图的失败可能会阻止其他视图执行。较新版本通过块隔离失败改善了这一点，但顺序执行仍然提供更清晰的失败语义。
:::

一般来说，当满足以下条件时启用 `parallel_view_processing=1`：

- 您有多个独立的物化视图
- 您的目标是最大化插入性能
- 您了解系统能够处理并发视图执行的能力

当：
- 物化视图之间存在依赖时，保持禁用
- 需要可预测、顺序的执行
- 想调试或审计插入行为并希望重放确定性

## 物化视图与公用表表达式（CTE） {#materialized-views-common-table-expressions-ctes}

**非递归** 公用表表达式（CTE）在物化视图中是支持的。

:::note 公用表表达式 **不** 被物化
ClickHouse 不对 CTE 进行物化；而是直接将 CTE 定义替换到查询中，这可能导致同一表达式多次评估（如果 CTE 被多次使用）。
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

虽然此处并不严格需要 CTE，但为了示例，视图将按预期工作：

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

在 ClickHouse 中，CTE 被内联，这意味着在优化期间，它们有效地被复制粘贴到查询中，而 **不** 被物化。这意味着：

- 如果您的 CTE 引用不同于源表（即物化视图所附加的表）的表，并且在 `JOIN` 或 `IN` 子句中使用，它将表现得像子查询或连接，而不是触发器。
- 物化视图仍然仅在主源表插入时触发，但 CTE 将在每次插入时重新执行，这可能导致不必要的开销，特别是当被引用的表很大时。

例如，

```sql
WITH recent_users AS (
  SELECT Id FROM stackoverflow.users WHERE CreationDate > now() - INTERVAL 7 DAY
)
SELECT * FROM stackoverflow.posts WHERE OwnerUserId IN (SELECT Id FROM recent_users)
```

在这种情况下，用户 CTE 在每次插入帖子时都会重新评估，并且物化视图不会在插入新用户时更新 - 只有在插入帖子时更新。

一般来说，使用 CTE 应用于操作与物化视图附加的源表相同的逻辑，或者确保引用的表较小，不太可能造成性能瓶颈。或者，考虑遵循物化视图与 JOIN 的 [相同优化](/materialized-view/incremental-materialized-view#join-best-practices)。
