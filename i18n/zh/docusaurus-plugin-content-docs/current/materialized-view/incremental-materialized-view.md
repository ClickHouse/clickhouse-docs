---
'slug': '/materialized-view/incremental-materialized-view'
'title': '增量物化视图'
'description': '如何使用增量物化视图加速查询'
'keywords':
- 'incremental materialized views'
- 'speed up queries'
- 'query optimization'
'score': 10000
---

import materializedViewDiagram from '@site/static/images/materialized-view/materialized-view-diagram.png';
import Image from '@theme/IdealImage';

## 背景 {#background}

增量物化视图（Materialized Views）允许用户将计算成本从查询时间转移到插入时间，从而加快 `SELECT` 查询。

与Postgres等事务型数据库不同，ClickHouse的物化视图仅是一个触发器，它会在数据块插入到表时运行查询。此查询的结果将插入到第二个“目标”表中。如果插入更多行，结果将再次发送到目标表，更新和合并中间结果。这个合并后的结果相当于对所有原始数据运行查询。

物化视图的主要动机是插入到目标表中的结果代表了对行进行聚合、过滤或转换的结果。这些结果通常是原始数据的一个较小表示（在聚合情况下为部分草图）。此外，从目标表读取结果的查询非常简单，确保查询时间比在原始数据上执行相同计算时更快，从而将计算（因此查询延迟）从查询时间转移到插入时间。

在ClickHouse中，物化视图随着数据实时流入它们所基于的表而更新，更像是不断更新的索引。这与其他数据库中的物化视图形成对比，后者通常是查询的静态快照，必须进行刷新的（类似于ClickHouse [可刷新的物化视图](/sql-reference/statements/create/view#refreshable-materialized-view)）。

<Image img={materializedViewDiagram} size="md" alt="物化视图图"/>

## 示例 {#example}

为了举例，我们将使用在“[架构设计](/data-modeling/schema-design)”中记录的Stack Overflow数据集。

假设我们想要获得某个帖子每天的赞成票和反对票数量。

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

由于ClickHouse中有[`toStartOfDay`](/sql-reference/functions/date-time-functions#tostartofday)函数，这个查询相对简单：

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

这个查询由于ClickHouse的性能已经很快，但我们可以做得更好吗？

如果我们想要在插入时间使用物化视图计算这个信息，我们需要一个表来接收结果。这个表应该每天只保留1行。如果收到现有日期的更新，其他列应合并到现有日期的行中。为了实现这种增量状态的合并，必须为其他列存储部分状态。

这需要ClickHouse中的一种特殊引擎类型：[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)。它会用一个包含数字列求和值的行替换所有具有相同排序键的行。以下表将合并任何具有相同日期的行，求和任何数值列：

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

为了演示物化视图，假设我们的投票表为空，还没有接收到任何数据。我们的物化视图在插入到`votes`中的数据上执行上述`SELECT`，结果发送到`up_down_votes_per_day`：

```sql
CREATE MATERIALIZED VIEW up_down_votes_per_day_mv TO up_down_votes_per_day AS
SELECT toStartOfDay(CreationDate)::Date AS Day,
       countIf(VoteTypeId = 2) AS UpVotes,
       countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY Day
```

这里的 `TO` 子句是关键，表示结果将发送到何处，即 `up_down_votes_per_day`。

我们可以从之前的插入中重新填充我们的投票表：

```sql
INSERT INTO votes SELECT toUInt32(Id) AS Id, toInt32(PostId) AS PostId, VoteTypeId, CreationDate, UserId, BountyAmount
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/*.parquet')

0 rows in set. Elapsed: 111.964 sec. Processed 477.97 million rows, 3.89 GB (4.27 million rows/s., 34.71 MB/s.)
Peak memory usage: 283.49 MiB.
```

完成后，我们可以确认我们的 `up_down_votes_per_day` 的大小 - 我们应该有每天1行：

```sql
SELECT count()
FROM up_down_votes_per_day
FINAL

┌─count()─┐
│    5723 │
└─────────┘
```

通过存储我们查询的结果，我们有效地将行数从2.38亿（在`votes`中）减少到5000。然而，关键在于，如果新的投票被插入到`votes`表中，新值将被发送到`up_down_votes_per_day`的相应日期，将在后台自动合并，确保每天只有一行。因此，`up_down_votes_per_day`将始终保持小且最新。

由于行的合并是异步的，当用户查询时，可能会有多于一天的投票。为了确保任何未合并的行在查询时被合并，我们有两个选择：

- 在表名上使用`FINAL`修饰符。我们在上面的计数查询中这样做了。
- 通过我们最终表中使用的排序键进行聚合，即`CreationDate`并求和指标。通常，这种方式更高效且灵活（该表可以用于其他用途），但前者对某些查询可能更简单。我们在下面展示了两者：

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

这将我们的查询速度从0.133秒提高到0.004秒 - 增加了25倍以上的改善！

:::important 重要提示: `ORDER BY` = `GROUP BY`
在大多数案例中，物化视图转换中`GROUP BY` 子句中使用的列，应该与目标表中`ORDER BY`子句中使用的列保持一致，尤其是在使用 `SummingMergeTree` 或 `AggregatingMergeTree` 表引擎时。这些引擎依赖于 `ORDER BY` 列，以在后台合并操作中合并具有相同值的行。`GROUP BY` 和 `ORDER BY` 列的不对应可能导致查询性能低效，合并效果不佳，甚至数据差异。
:::

### 更复杂的示例 {#a-more-complex-example}

上面的示例使用物化视图计算和维护每天两个总和。总和代表了最简单的部分状态聚合形式 - 我们可以在新值到达时将其新增到现有值中。然而，ClickHouse的物化视图可以用于任何聚合类型。

假设我们希望为每一天计算一些统计数据：`Score`的99.9百分位和`CommentCount`的平均值。计算该指标的查询可能如下所示：

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

与之前一样，我们可以创建一个物化视图，在新的帖子被插入到`posts`表中时执行上述查询。

为了举例说明，为避免从S3加载帖子数据，我们将创建一个与`posts`具有相同架构的重复表`posts_null`。然而，该表将不存储任何数据，仅供物化视图在插入行时使用。为了防止存储数据，我们可以使用[`Null`表引擎类型](/engines/table-engines/special/null)。

```sql
CREATE TABLE posts_null AS posts ENGINE = Null
```

Null表引擎是一种强大的优化 - 可以将其想象为`/dev/null`。在插入时，当`posts_null`表接收行时，我们的物化视图将计算并存储汇总统计数据 - 它只是一个触发器。然而，原始数据不会被存储。虽然在我们的情况下，可能仍然希望存储原始帖子，但该方法可用于计算聚合，同时避免原始数据的存储开销。

因此，物化视图变为：

```sql
CREATE MATERIALIZED VIEW post_stats_mv TO post_stats_per_day AS
       SELECT toStartOfDay(CreationDate) AS Day,
       quantileState(0.999)(Score) AS Score_quantiles,
       avgState(CommentCount) AS AvgCommentCount
FROM posts_null
GROUP BY Day
```

注意，我们在聚合函数的末尾附加了后缀`State`。这确保返回的是函数的聚合状态，而不是最终结果。它将包含额外信息，以允许此部分状态与其他状态合并。例如，在平均值的情况下，它将包括列的计数和和。

> 部分聚合状态是计算正确结果所必需的。例如，对于计算平均值，仅仅对子范围的平均值进行平均会产生不正确的结果。

我们现在为此视图创建目标表 `post_stats_per_day`，以存储这些部分聚合状态：

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

虽然之前的 `SummingMergeTree` 足以存储计数，但我们需要一个更高级的引擎类型来处理其他函数：[`AggregatingMergeTree`](/engines/table-engines/mergetree-family/aggregatingmergetree)。
为了确保ClickHouse知道将存储聚合状态，我们将`Score_quantiles`和`AvgCommentCount`定义为 `AggregateFunction` 类型，指定部分状态的函数源和源列的类型。与 `SummingMergeTree` 类似，具有相同 `ORDER BY` 键值的行将进行合并（在上面的示例中是 `Day`）。

为了通过我们的物化视图填充`post_stats_per_day`，我们可以简单地将所有行从`posts`插入到`posts_null`中：

```sql
INSERT INTO posts_null SELECT * FROM posts

0 rows in set. Elapsed: 13.329 sec. Processed 119.64 million rows, 76.99 GB (8.98 million rows/s., 5.78 GB/s.)
```

> 在生产环境中，您可能会将物化视图附加到`posts`表。我们在这里使用`posts_null`只是为了演示null表。

我们的最终查询需要利用函数的 `Merge` 后缀（因为列存储部分聚合状态）：

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

请注意，我们在这里使用`GROUP BY`而不是使用`FINAL`。

## 其他应用 {#other-applications}

上述内容主要集中在使用物化视图增量更新部分数据聚合，从而将计算从查询转移到插入时间。除了这个常见用例外，物化视图还有许多其他应用。

### 过滤和转换 {#filtering-and-transformation}

在某些情况下，我们可能只希望在插入时插入行和列的子集。在这种情况下，我们的`posts_null` 表可以接收插入，以 `SELECT` 查询过滤行，然后再插入到`posts`表中。例如，假设我们希望转换`posts`表中的`Tags`列。该列包含一个用管道分隔的标签名称列表。通过将这些转换为数组，我们可以更容易地按单个标签值进行聚合。

> 我们可以在运行 `INSERT INTO SELECT` 时执行此转换。物化视图允许我们将此逻辑封装在ClickHouse DDL中，并保持我们的`INSERT`简单，对新行应用转换。

我们的物化视图如下所示：

```sql
CREATE MATERIALIZED VIEW posts_mv TO posts AS
        SELECT * EXCEPT Tags, arrayFilter(t -> (t != ''), splitByChar('|', Tags)) as Tags FROM posts_null
```

### 查找表 {#lookup-table}

用户在选择ClickHouse的排序键时应考虑他们的访问模式。经常用于过滤和聚合子句的列应优先采用。在用户有更多多样化访问模式，无法用一组列封装的场景中，这可能会很受限制。例如，考虑以下`comments`表：

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

这里的排序键优化了针对通过`PostId`的查询。

假设用户希望根据某个特定的 `UserId` 过滤，并计算他们的`Score`平均值：

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

虽然快速（ClickHouse的数据很小），但我们可以从处理的行数——9038万中看出，这需要全表扫描。对于更大的数据集，我们可以使用物化视图查找我们的排序键值`PostId`以过滤列`UserId`。这些值然后可以用于执行高效的查找。

在本例中，我们的物化视图可以非常简单，仅在插入时从`comments`中选择`PostId`和`UserId`。这些结果又发送到一个按`UserId`排序的表 `comments_posts_users`。我们在下面创建了评论表的null版本，并利用这个来填充我们的视图和`comments_posts_users`表：

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

现在我们可以在子查询中使用这个视图来加速我们之前的查询：

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

物化视图可以链接，从而建立复杂的工作流程。有关具体示例，建议阅读这篇 [博客文章](https://clickhouse.com/blog/chaining-materialized-views)。

## 物化视图与JOINs {#materialized-views-and-joins}

:::note 可刷新的物化视图
以下仅适用于增量物化视图。可刷新的物化视图定期对完整目标数据集执行查询，并完全支持JOIN操作。如果可以容忍结果新鲜度的降低，请考虑在复杂JOIN中使用它们。
:::

ClickHouse中的增量物化视图完全支持 `JOIN` 操作，但有一个关键限制：**物化视图仅在对源表（查询中最左侧的表）插入时触发。** JOIN中的右侧表不会触发更新，即使它们的数据发生变化。此行为在构建 **增量** 物化视图时尤为重要，因为数据在插入时间进行聚合或转换。

当通过 `JOIN` 定义增量物化视图时，在 `SELECT` 查询中最左侧的表充当源。当新行插入到该表时，ClickHouse仅对新插入的行执行物化视图查询。JOIN中的右侧表在此执行过程中会完全读取，但仅对它们的更改不会触发该视图。

这种行为使得物化视图中的JOIN类似于对静态维度数据的快照连接。

这非常适合利用引用或维度表来丰富数据。然而，右侧表的任何更新（例如用户元数据）将不会追溯更新物化视图。要查看更新的数据，源表中必须到达新的插入。

### 示例 {#materialized-views-and-joins-example}

让我们用[Stack Overflow数据集](/data-modeling/schema-design)来走一个具体的示例。我们将使用物化视图来计算**每日每用户徽章**，包括来自`users`表的用户显示名称。

作为提醒，我们的表架构为：

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

我们假设我们的`users`表已预填充：

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
物化视图中的 `GROUP BY` 子句必须包含 `DisplayName`、`UserId` 和 `Day`，以匹配 `SummingMergeTree` 目标表中的 `ORDER BY`。这确保行被正确聚合和合并。遗漏任何一项都可能导致不正确的结果或低效的合并。
:::

如果我们现在填充徽章，视图将被触发 - 填充我们的 `daily_badges_by_user` 表。

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 433.762 sec. Processed 1.16 billion rows, 28.50 GB (2.67 million rows/s., 65.70 MB/s.)
```

假设我们希望查看特定用户获得的徽章，可以写出以下查询：

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

现在，如果这个用户获得了新徽章并插入了一行，我们的视图将更新：

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
请注意此处插入的延迟。插入的用户行与整个 `users` 表连接，显著影响插入性能。我们在下面的["在物化视图中使用源表作为过滤器和连接"](/materialized-view/incremental-materialized-view#using-source-table-in-filters-and-joins-in-materialized-views)部分建议了应对方法。
:::

相反，如果我们为新用户插入徽章，然后插入该用户的行，物化视图将无法捕获用户的指标。

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

在这种情况下，视图仅在徽章插入时执行，而在用户行存在之前。如果我们为用户再插入另一枚徽章，一行被插入，如预期的那样：

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

然而，请注意，该结果是错误的。

### 物化视图中JOIN的最佳实践 {#join-best-practices}

- **使用最左侧的表作为触发器。** 仅在 `SELECT` 语句左侧的表触发物化视图。对右侧表的更改不会触发更新。

- **预插入连接的数据。** 确保在将行插入源表之前，连接表中的数据存在。JOIN在插入时进行评估，因此缺失数据将导致不匹配的行或空值。

- **限制从JOIN中拉取的列。** 仅选择连接表中所需的列，以最小化内存使用并减少插入时间延迟（见下文）。

- **评估插入时性能。** JOIN会增加插入成本，尤其是对于大型右侧表。使用有代表性的生产数据进行基准测试插入速度。

- **对简单查找优先使用字典。** 使用 [字典](/dictionary) 进行键值查找（例如，用户ID到名称），以避免昂贵的JOIN操作。

- **为合并效率对齐 `GROUP BY` 和 `ORDER BY`。** 在使用 `SummingMergeTree` 或 `AggregatingMergeTree` 时，确保 `GROUP BY` 与目标表中的 `ORDER BY` 子句匹配，以允许有效的行合并。

- **使用明确的列别名。** 当表具有重叠的列名时，使用别名以避免模糊，并确保目标表中的正确结果。

- **考虑插入量和频率。** JOIN在适度插入工作负载下效果良好。对于高吞吐量的摄取，考虑使用临时表、预连接或其他方法，如字典和[可刷新的物化视图](/materialized-view/refreshable-materialized-view)。

### 在过滤器和JOIN中使用源表 {#using-source-table-in-filters-and-joins-in-materialized-views}

在ClickHouse中处理物化视图时，了解源表在物化视图查询执行期间的处理方式非常重要。具体而言，物化视图查询中的源表将被插入的数据块替换。如果没有正确理解，这种行为可能会导致一些意外的结果。

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

在上述示例中，我们有两个物化视图`mvw1`和`mvw2`，它们执行类似的操作，但对源表`t0`的引用略有不同。

在`mvw1`中，表`t0`被直接引用在JOIN右侧的`(SELECT * FROM t0)`子查询中。当数据插入到`t0`时，物化视图的查询将执行，插入的数据块替换` t0`。这意味着JOIN操作仅对新插入的行执行，而不对整个表执行。

在与`vt0`连接的第二种情况中，视图读取`t0`中的所有数据。这确保JOIN操作考虑到`t0`中的所有行，而不仅仅是新插入的数据块。

关键的区别在于ClickHouse如何在物化视图的查询中处理源表。当通过插入触发物化视图时，源表（在这种情况下是`t0`）被插入的数据块替换。这种行为可以被用来优化查询，但也需要谨慎考虑以避免意外结果。

### 用例和注意事项 {#use-cases-and-caveats}

在实践中，您可以利用这种行为来优化仅需处理源表数据子集的物化视图。例如，您可以使用子查询在将源表与其他表连接之前过滤源表。这有助于减少物化视图处理的数据量并提高性能。

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

在这个例子中，由子查询构建的集合`IN (SELECT id FROM t0)`仅包含新插入的行，这可以帮助对`t1`进行过滤。

#### 使用Stack Overflow的示例 {#example-with-stack-overflow}

考虑我们之前的物化视图示例，以计算**每日每用户徽章**，包括来自`users`表的用户显示名称。

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

这个视图对`badges`表的插入延迟产生了显著影响，例如：

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 7.517 sec.
```

使用上述方法，我们可以优化这个视图。我们将使用插入的徽章行中的用户ID对`users`表添加一个过滤器：

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

这不仅加快了初始徽章插入的速度：

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 132.118 sec. Processed 323.43 million rows, 4.69 GB (2.45 million rows/s., 35.49 MB/s.)
Peak memory usage: 1.99 GiB.
```

而且也意味着未来的徽章插入是高效的：

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 0.583 sec.
```

在上述操作中，只为用户ID `2936484` 从用户表检索了一行。此查找还通过表的排序键`Id`进行了优化。

## 物化视图与UNIONs {#materialized-views-and-unions}

`UNION ALL` 查询通常用于将多个源表中的数据合并到一个结果集中。

虽然增量物化视图不直接支持`UNION ALL`，但可以通过为每个 `SELECT` 分支创建一个单独的物化视图，并将它们的结果写入共享目标表来实现相同的结果。

在我们的示例中，我们将使用Stack Overflow数据集。考虑下面的`badges`和`comments`表，分别表示用户获得的徽章和他们对帖子做出的评论：

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

可以使用以下`INSERT INTO`命令填充这些表：

```sql
INSERT INTO stackoverflow.badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')
INSERT INTO stackoverflow.comments SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/comments/*.parquet')
```

假设我们希望创建一个统一的用户活动视图，显示每个用户的最后活动，通过组合这两个表：

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

我们假设有一个目标表来接收此查询的结果。注意使用了 [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) 表引擎和 [AggregateFunction](/sql-reference/data-types/aggregatefunction)，以确保结果正确合并：

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

希望此表在`badges`或`comments`中插入新行时更新，针对此问题，简单的解决方案可能是尝试创建具有前一个联合查询的物化视图：

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

虽然在语法上是有效的，但会产生意想不到的结果——视图将仅对`comments`表触发插入。例如：

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

插入`badges`表将触发视图，导致`user_activity`没有接收到更新：

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

为了解决这个问题，我们只需为每个SELECT语句创建一个物化视图：

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

现在插入到任何表都会产生正确的结果。例如，如果我们对`comments`表插入：

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

同样，插入到`badges`表的操作也反映在`user_activity`表中：

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

如前一个示例所示，一个表可以作为多个物化视图的源。这些视图的执行顺序取决于设置[`parallel_view_processing`](/operations/settings/settings#parallel_view_processing)。

默认情况下，此设置等于`0`（`false`），意味着物化视图按 `uuid` 顺序顺序执行。

例如，考虑以下 `source` 表和3个物化视图，每个物化视图将行发送到一个 `target` 表：

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

注意，每个视图在将其行插入到`target`表之前暂停1秒，同时还包含它们的名称和插入时间。

向表`source`插入一行大约需要3秒，每个视图顺序执行：

```sql
INSERT INTO source VALUES ('test')

1 row in set. Elapsed: 3.786 sec.
```

我们可以通过 `SELECT` 确认每行到达的情况：

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

这与视图的 `uuid` 是对齐的：

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

相反，考虑启用`parallel_view_processing=1`时插入一行会发生什么。启用后，视图会并行执行，不保证行到达目标表的顺序：

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

虽然每个视图返回行的顺序相同，但这并没有保证——通过每行的插入时间的相似性可以看出。此外，请注意插入性能的提升。

### 何时使用并行处理 {#materialized-views-when-to-use-parallel}

启用 `parallel_view_processing=1`可以显著提高插入吞吐量，如上所示，尤其是当多个物化视图附加到同一表时。然而，了解取舍是非常重要的：

- **增加插入压力**：所有物化视图同时执行，增加CPU和内存使用。如果每个视图执行繁重的计算或JOIN，这可能会导致系统超载。
- **需要严格的执行顺序**：在某些工作流中，视图执行的顺序很重要（例如，链式依赖），并行执行可能导致不一致状态或竞争条件。虽然可以设计成这样，但这种设置是脆弱的，未来版本可能会破坏。

:::note 历史默认设置和稳定性
顺序执行曾是长期的默认设置，部分原因是错误处理的复杂性。历史上，一个物化视图中的失败可能会阻止其他视图执行。较新版本通过对每个块隔离失败改进了这一点，但顺序执行仍可提供更清晰的失败语义。
:::

通常情况是，当：

- 您有多个独立的物化视图
- 您的目标是最大化插入性能
- 您清楚系统的容量以处理并发视图执行

保持禁用当：
- 物化视图之间相互依赖
- 需要可预测的、有序的执行
- 正在调试或审核插入行为并希望进行确定性重放


## 物化视图与公共表表达式（CTEs） {#materialized-views-common-table-expressions-ctes}

**非递归**公共表表达式（CTEs）在物化视图中受到支持。

:::note 公共表表达式 **不是** 物化的
ClickHouse 不会对 CTE 进行物化；相反，它会直接将 CTE 定义替换到查询中，这可能导致对同一表达式的多次评估（如果 CTE 使用超过一次）。
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

虽然在这里严格来说 CT 不是必需的，但为了示例的目的，视图将按预期工作：

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

在ClickHouse中，CTE是内联的，这意味着它们在优化时实际上被复制粘贴到查询中，而**没有**物化。这意味着：

- 如果您的CTE引用的是源表之外的不同表（即，物化视图附加的表），并在`JOIN`或`IN`子句中使用，则它将像子查询或连接，而不是触发器那样工作。
- 物化视图仍然只在对主源表插入时触发，但CTE将每次插入时重新执行，这可能会导致不必要的开销，尤其是如果引用的表很大时。

例如，

```sql
WITH recent_users AS (
  SELECT Id FROM stackoverflow.users WHERE CreationDate > now() - INTERVAL 7 DAY
)
SELECT * FROM stackoverflow.posts WHERE OwnerUserId IN (SELECT Id FROM recent_users)
```

在这种情况下，用户CTE在每次向帖子插入时都被重新评估，而物化视图不会因新用户插入而更新——只有在帖子插入时才会更新。

通常，使用CTE时应确保其操作涉及与物化视图附加到相同的源表，或者确保引用的表较小，不太可能导致性能瓶颈。或者，考虑与物化视图一起使用JOIN时的相同优化方案 [/materialized-view/incremental-materialized-view#join-best-practices]。
