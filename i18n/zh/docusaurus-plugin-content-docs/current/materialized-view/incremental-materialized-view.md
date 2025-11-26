---
slug: /materialized-view/incremental-materialized-view
title: '增量物化视图'
description: '如何使用增量物化视图加速查询'
keywords: ['增量物化视图', '加速查询', '查询优化']
score: 10000
doc_type: 'guide'
---

import materializedViewDiagram from '@site/static/images/materialized-view/materialized-view-diagram.png';
import Image from '@theme/IdealImage';


## 背景 {#background}

增量物化视图（Materialized Views）允许用户将计算成本从查询时转移到插入时，从而使 `SELECT` 查询更快。

与 Postgres 等事务型数据库不同，ClickHouse 的物化视图本质上是一个触发器，它会在数据块插入到表中时对这些数据块执行查询。该查询的结果会被插入到第二个“目标”表中。当有更多行被插入时，结果会再次写入目标表，此时中间结果会在目标表中更新并合并。这个合并后的结果等价于在全部原始数据上运行该查询所得的结果。

使用物化视图的主要目的在于：插入到目标表中的结果代表了对行进行聚合、过滤或转换之后的结果。这些结果通常是原始数据的精简表示（在聚合的情况下是部分概要）。这一点，再加上从目标表读取结果时使用的查询通常较为简单，从而保证了查询时间会比在原始数据上进行同样计算要快，将计算（以及相应的查询延迟）从查询时转移到了插入时。

ClickHouse 中的物化视图会在其依赖的表有数据流入时实时更新，更像是持续更新的索引。这与其他数据库形成对比，在那些数据库中，物化视图通常是查询的静态快照，必须定期刷新（类似于 ClickHouse 的[可刷新的物化视图](/sql-reference/statements/create/view#refreshable-materialized-view)）。

<Image img={materializedViewDiagram} size="md" alt="物化视图示意图"/>



## 示例

在本示例中，我们将使用 [&quot;Schema Design&quot;](/data-modeling/schema-design) 中介绍的 Stack Overflow 数据集。

假设我们想要获取某个帖子每天收到的赞成票和反对票数量。

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

在 ClickHouse 中，得益于 [`toStartOfDay`](/sql-reference/functions/date-time-functions#toStartOfDay) 函数，这个查询相对比较简单：

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

返回 10 行。用时:0.133 秒。已处理 2.3898 亿行,2.15 GB(17.9 亿行/秒,16.14 GB/秒)。
内存峰值:363.22 MiB。
```

多亏了 ClickHouse，这个查询已经很快了，但我们还能做得更好吗？

如果我们希望在插入时使用物化视图来计算这个结果，就需要一个表来接收计算结果。这个表应该每天只保留 1 行。如果某一天已有数据而又收到更新，其他列应当合并到该日期已有的那一行中。要实现这种增量状态的合并，其他列必须存储中间状态。

这在 ClickHouse 中需要一种特殊的引擎类型：[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)。它会将所有具有相同排序键的行替换为一行，并在该行中保存数值列的求和值。下面的表会合并所有具有相同日期的行，并对所有数值列进行求和：

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

为了演示我们的物化视图，假设当前 `votes` 表为空，尚未接收到任何数据。我们的物化视图会对写入 `votes` 的数据执行上述 `SELECT`，并将结果写入 `up_down_votes_per_day`：

```sql
CREATE MATERIALIZED VIEW up_down_votes_per_day_mv TO up_down_votes_per_day AS
SELECT toStartOfDay(CreationDate)::Date AS Day,
       countIf(VoteTypeId = 2) AS UpVotes,
       countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY Day
```

这里的 `TO` 子句是关键，它表示结果将被发送到的目标，即 `up_down_votes_per_day`。


我们可以通过之前的 INSERT 语句重新填充 `votes` 表：

```sql
INSERT INTO votes SELECT toUInt32(Id) AS Id, toInt32(PostId) AS PostId, VoteTypeId, CreationDate, UserId, BountyAmount
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/*.parquet')

返回 0 行。耗时：111.964 秒。处理了 4.7797 亿行，3.89 GB（427 万行/秒，34.71 MB/秒）。
峰值内存使用：283.49 MiB。
```

完成后，我们可以确认 `up_down_votes_per_day` 的大小——它应该是每天一行记录：

```sql
SELECT count()
FROM up_down_votes_per_day
FINAL

┌─count()─┐
│    5723 │
└─────────┘
```

在这里，我们通过存储查询结果，将行数从 2.38 亿（`votes` 表中）有效减少到了 5000 行。不过，关键在于：如果有新的投票插入到 `votes` 表中，相应日期的新值会写入到 `up_down_votes_per_day` 中，并在后台异步自动合并——从而每天只保留一行。因此，`up_down_votes_per_day` 将始终既小巧又是最新的。

由于行合并是异步进行的，当用户查询时，每天可能会存在多行投票记录。为了确保在查询时将所有尚未合并的行合并，我们有两种选择：

* 在查询中对表名使用 `FINAL` 修饰符。我们在上面的计数查询中就是这么做的。
* 按最终表中使用的排序键（即 `CreationDate`）进行聚合并对指标求和。通常这更高效且更灵活（该表可以用于其他用途），但前一种方式对于某些查询来说更简单。下面我们展示这两种方式：

```sql
SELECT
        Day,
        UpVotes,
        DownVotes
FROM up_down_votes_per_day
FINAL
ORDER BY Day ASC
LIMIT 10

返回 10 行。用时:0.004 秒。已处理 8.97 千行,89.68 KB(209 万行/秒,20.89 MB/秒)。
峰值内存使用量:289.75 KiB。

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

返回 10 行。用时:0.010 秒。已处理 8.97 千行,89.68 KB(90.73 万行/秒,9.07 MB/秒)。
峰值内存使用量:567.61 KiB。
```

这将把我们的查询耗时从 0.133s 缩短到 0.004s——性能提升超过 25 倍！

:::important 重要说明：`ORDER BY` = `GROUP BY`
在大多数情况下，如果使用 `SummingMergeTree` 或 `AggregatingMergeTree` 表引擎，物化视图转换中 `GROUP BY` 子句使用的列应当与目标表中 `ORDER BY` 子句使用的列保持一致。这些引擎依赖 `ORDER BY` 列在后台合并操作期间合并具有相同值的行。`GROUP BY` 与 `ORDER BY` 列不一致会导致查询性能低下、合并效果不佳，甚至数据不一致。
:::

### 更复杂的示例


上面的示例使用物化视图按天计算并维护两个求和值。求和是维护部分聚合状态的最简单形式——当有新值到达时，我们只需将其累加到已有值上即可。不过，ClickHouse 的物化视图可以用于任意类型的聚合。

假设我们希望针对每天的帖子计算一些统计信息：`Score` 的 99.9 百分位数，以及 `CommentCount` 的平均值。用于计算这些统计信息的查询可能如下所示：

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

返回 10 行。用时:0.113 秒。处理了 5982 万行,777.65 MB(5.2848 亿行/秒,6.87 GB/秒)。
峰值内存使用量:658.84 MiB。
```

与之前一样，我们可以创建一个物化视图，在向 `posts` 表插入新帖子时执行上述查询。

为了示例演示，并避免从 S3 加载帖子数据，我们将创建一个与 `posts` 具有相同表结构的副本表 `posts_null`。不过，该表不会存储任何数据，而仅在插入行时供物化视图使用。为了避免实际存储数据，我们可以使用 [`Null` 表引擎类型](/engines/table-engines/special/null)。

```sql
CREATE TABLE posts_null AS posts ENGINE = Null
```

Null 表引擎是一种强大的优化——可以把它看作 `/dev/null`。当我们的 `posts_null` 表在插入时接收到行数据时，物化视图会计算并存储汇总统计信息——它本质上就像一个触发器。不过，原始数据不会被存储。虽然在我们的场景中，我们很可能仍然希望保存原始帖子，但这种方法可以在避免保存原始数据所带来的存储开销的同时，用于计算聚合结果。

因此，物化视图变为：

```sql
CREATE MATERIALIZED VIEW post_stats_mv TO post_stats_per_day AS
       SELECT toStartOfDay(CreationDate) AS Day,
       quantileState(0.999)(Score) AS Score_quantiles,
       avgState(CommentCount) AS AvgCommentCount
FROM posts_null
GROUP BY Day
```

请注意我们如何在聚合函数名后追加后缀 `State`。这可以确保返回的是函数的聚合状态，而不是最终结果。该状态将包含额外信息，以便这个部分状态可以与其他状态合并。例如，对于求平均值的情况，其中会包含该列的计数和总和。

> 部分聚合状态对于计算正确结果是必需的。例如，在计算平均值时，简单地对各子区间的平均值再取平均会得到错误的结果。

现在我们为视图 `post_stats_per_day` 创建对应的目标表，用于存储这些部分聚合状态：


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

之前 `SummingMergeTree` 足以用来存储计数，但对于其他函数，我们需要一个更高级的引擎类型：[`AggregatingMergeTree`](/engines/table-engines/mergetree-family/aggregatingmergetree)。
为了让 ClickHouse 知道将会存储聚合状态，我们将 `Score_quantiles` 和 `AvgCommentCount` 定义为 `AggregateFunction` 类型，指定这些部分聚合状态对应的聚合函数以及其源列的类型。与 `SummingMergeTree` 类似，具有相同 `ORDER BY` 键值的行会被合并（在上面的示例中为 `Day`）。

为了通过物化视图向我们的 `post_stats_per_day` 填充数据，我们可以简单地将 `posts` 中的所有行插入到 `posts_null` 中：

```sql
INSERT INTO posts_null SELECT * FROM posts

0 rows in set. Elapsed: 13.329 sec. Processed 119.64 million rows, 76.99 GB (8.98 million rows/s., 5.78 GB/s.)
```

> 在生产环境中，你通常会将这个物化视图关联到 `posts` 表。我们在这里使用 `posts_null`，是为了演示 null 表。

我们的最终查询需要在函数名中使用 `Merge` 后缀（因为这些列存储的是部分聚合状态）：

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

请注意，这里我们使用 `GROUP BY` 而不是 `FINAL`。


## 其他应用场景

上文主要聚焦于使用物化视图对数据的部分聚合结果进行增量更新，从而将计算从查询时点前移到写入时点。除了这一常见用例之外，物化视图还有许多其他应用场景。

### 过滤与转换

在某些情况下，我们可能只希望在写入时插入部分行和列。在这种情况下，我们可以向 `posts_null` 表执行插入操作，并通过一条 `SELECT` 查询在写入到 `posts` 表之前对行进行过滤。例如，假设我们希望转换 `posts` 表中的 `Tags` 列。该列包含以竖线分隔的标签名称列表。通过将其转换为数组，我们可以更轻松地按单个标签值进行聚合。

> 我们可以在执行 `INSERT INTO SELECT` 时完成这一转换。物化视图使我们能够在 ClickHouse DDL 中封装这段逻辑，从而保持我们的 `INSERT` 语句简洁，并将转换应用到所有新写入的行上。

用于实现该转换的物化视图如下所示：

```sql
CREATE MATERIALIZED VIEW posts_mv TO posts AS
        SELECT * EXCEPT Tags, arrayFilter(t -> (t != ''), splitByChar('|', Tags)) as Tags FROM posts_null
```

### 查找表

用户在选择 ClickHouse 排序键时，应当考虑其访问模式。应优先选择那些在过滤和聚合子句中经常被使用的列。对于那些访问模式更加多样、无法用同一组列来概括的场景，这种做法可能会比较受限。比如，考虑下面的 `comments` 表：

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

0 行结果。用时:46.357 秒。已处理 9038 万行,11.14 GB(195 万行/秒,240.22 MB/秒)
```

此处的排序键使表在按 `PostId` 过滤的查询中得到优化。

假设某个用户希望基于特定的 `UserId` 进行过滤，并计算其平均 `Score`：

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

┌──────────avg(Score)─┐
│ 0.18181818181818182 │
└─────────────────────┘

返回 1 行。用时:0.778 秒。已处理 9038 万行,361.59 MB(每秒 1.1616 亿行,464.74 MB/秒)。
内存峰值:217.08 MiB。
```

虽然速度很快（对 ClickHouse 来说数据量很小），但从处理的行数——9038 万行——可以看出，这仍然需要一次全表扫描。对于更大的数据集，我们可以使用物化视图，通过过滤列 `UserId` 查找我们的排序键 `PostId` 的取值。随后可以使用这些值执行一次高效的查找。

在这个示例中，我们的物化视图可以非常简单，只需在插入时从 `comments` 中选择 `PostId` 和 `UserId`。这些结果随后会被写入一个按 `UserId` 排序的表 `comments_posts_users`。我们在下方创建一个空的 `Comments` 表副本，并使用它来填充我们的视图和 `comments_posts_users` 表：

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

返回 0 行。用时：5.163 秒。处理了 9038 万行，17.25 GB（每秒 1751 万行，3.34 GB/秒）。
```

现在可以在子查询中使用该视图，以加速我们之前的查询：

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
```


结果集包含 1 行。耗时：0.012 秒。已处理 88.61 千行，771.37 KB（7.09 百万行/秒，61.73 MB/秒）

```

### 链式/级联物化视图 {#chaining}

物化视图可以链式连接(或级联),以构建复杂的工作流。
有关更多信息,请参阅["级联物化视图"](https://clickhouse.com/docs/guides/developer/cascading-materialized-views)指南。
```


## 物化视图与 JOIN

:::note 可刷新物化视图
下面内容仅适用于增量物化视图。可刷新物化视图会定期针对完整目标数据集执行其查询，并且完全支持 JOIN。如果可以接受结果新鲜度有所降低，请考虑在复杂 JOIN 场景中使用它们。
:::

ClickHouse 中的增量物化视图完全支持 `JOIN` 操作，但有一个关键约束：**物化视图只会在源表（查询中最左侧的表）发生插入时被触发。** JOIN 中右侧的表即使数据发生变化，也不会触发更新。这一点在构建**增量**物化视图时尤为重要，因为数据是在插入时进行聚合或转换的。

当使用 `JOIN` 定义一个增量物化视图时，`SELECT` 查询中最左侧的表充当源表。当有新行插入该表时，ClickHouse 仅使用这些新插入的行来执行物化视图查询。在这次执行过程中，JOIN 中的右侧表会被完整读取，但仅右侧表的数据变化本身不会触发视图。

这种行为使得物化视图中的 JOIN 类似于针对静态维度数据进行的一次快照式关联。

这对于使用参考表或维度表来丰富数据非常有效。然而，对右侧表（例如用户元数据）的任何更新都不会对物化视图进行追溯更新。若要看到更新后的数据，必须在源表中有新的插入到来。

### 示例

让我们通过一个使用 [Stack Overflow 数据集](/data-modeling/schema-design) 的具体示例来说明。我们将使用一个物化视图来计算**每个用户的每日徽章数**，同时包含来自 `users` 表的用户显示名称。

回顾一下，我们的表结构如下：

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

假设我们的 `users` 表中已经预先填充了数据：

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

:::note 分组与排序对齐
物化视图中的 `GROUP BY` 子句必须包含 `DisplayName`、`UserId` 和 `Day`，以与 `SummingMergeTree` 目标表中的 `ORDER BY` 对齐。这可确保行被正确聚合和合并。省略其中任意一个都可能导致结果不正确或合并效率低下。
:::

现在如果我们写入徽章数据，该视图就会被触发，从而填充我们的 `daily_badges_by_user` 表。

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

返回 0 行。耗时：433.762 秒。处理了 11.6 亿行，28.50 GB（267 万行/秒，65.70 MB/秒）
```

如果我们想要查看某个特定用户获得的徽章，可以编写如下查询：


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

返回 8 行。用时:0.018 秒。已处理 32.77 千行,642.14 KB(186 万行/秒,36.44 MB/秒)
```

现在，如果该用户获得一个新徽章并插入一行记录，我们的视图就会更新：

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
请注意此处插入操作的延迟。插入的用户行会与整个 `users` 表做 JOIN，显著影响插入性能。针对这一问题，我们在下文的 [&quot;在过滤和 JOIN 中使用源表&quot;](/materialized-view/incremental-materialized-view#using-source-table-in-filters-and-joins-in-materialized-views) 一节中提出了解决方案。
:::

相反，如果我们先为新用户插入一条 badge 记录，然后再插入该用户的行，那么物化视图将无法捕获该用户的指标数据。

```sql
INSERT INTO badges VALUES (53505059, 23923286, 'Good Answer', now(), 'Bronze', 0);
INSERT INTO users VALUES (23923286, 1, now(),  'brand_new_user', now(), 'UK', 1, 1, 0);
```


```sql
SELECT *
FROM daily_badges_by_user
FINAL
WHERE DisplayName = 'brand_new_user';

返回 0 行。耗时:0.017 秒。已处理 32.77 千行,644.32 KB(1.98 百万行/秒,38.94 MB/秒)
```

在这种情况下，该视图仅会在用户行尚不存在时，为插入 badge 的操作执行。若我们为该用户再插入一个 badge，就会插入一行记录，这与预期一致：

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

不过请注意，这个结果是不正确的。

### 在物化视图中使用 JOIN 的最佳实践

* **将最左侧的表作为触发器。** 只有 `SELECT` 语句左侧的表会触发物化视图。右侧表的更改不会触发更新。

* **预先插入已 JOIN 的数据。** 确保在向源表插入行之前，已 JOIN 的表中的数据已经存在。JOIN 在插入时评估，因此缺失数据会导致行无法匹配或出现 null。

* **限制从 JOIN 中拉取的列。** 仅从 JOIN 的表中选择所需列，以最小化内存使用并减少插入时的延迟（见下文）。

* **评估插入时性能。** JOIN 会增加插入成本，尤其是在右侧表很大的情况下。使用具有代表性的生产数据对插入速率进行基准测试。

* **对于简单查找优先使用字典。** 对于键值查找（例如用户 ID 到姓名），使用 [Dictionaries](/dictionary) 来避免昂贵的 JOIN 操作。

* **对齐 `GROUP BY` 与 `ORDER BY` 以提升合并效率。** 当使用 `SummingMergeTree` 或 `AggregatingMergeTree` 时，确保 `GROUP BY` 与目标表中的 `ORDER BY` 子句一致，以便高效合并行。

* **使用显式列别名。** 当表之间存在重名列时，使用别名以避免歧义，并确保目标表中的结果正确。

* **考虑插入量与插入频率。** 在中等插入负载下，JOIN 表现良好。对于高吞吐量摄取场景，考虑使用中间表、预先 JOIN，或其他方案，例如 Dictionaries 和 [Refreshable Materialized Views](/materialized-view/refreshable-materialized-view)。

### 在过滤和 JOIN 中使用源表

在 ClickHouse 中使用物化视图时，非常有必要理解源表在物化视图查询执行期间是如何处理的。具体来说，物化视图查询中的源表会被替换为正在被插入的数据块。如果没有正确理解这一行为，可能会导致一些出乎意料的结果。

#### 示例场景

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


#### 解释

在上面的示例中，我们有两个物化视图 `mvw1` 和 `mvw2`，它们执行的操作类似，但在引用源表 `t0` 的方式上存在细微差别。

在 `mvw1` 中，表 `t0` 被直接在 JOIN 右侧的 `(SELECT * FROM t0)` 子查询中引用。当向 `t0` 插入数据时，会执行物化视图的查询，并用本次插入的数据块替代对 `t0` 的引用。也就是说，JOIN 操作仅在新插入的行上执行，而不是在整张表上执行。

在第二种使用 `vt0` 进行 JOIN 的情况下，视图会读取 `t0` 中的全部数据。这确保了 JOIN 操作会考虑 `t0` 中的所有行，而不仅仅是新插入的数据块。

关键差异在于 ClickHouse 在物化视图的查询中如何处理源表。当物化视图由插入操作触发时，源表（在本例中为 `t0`）会被插入的数据块替换。这种行为可以用于优化查询，但也需要仔细权衡，以避免出现意外结果。

### 使用场景与注意事项

在实践中，可以利用这种行为来优化只需处理源表部分数据的物化视图。例如，可以使用子查询在将源表与其他表进行 JOIN 之前先对其进行过滤。这样可以减少物化视图需要处理的数据量，从而提升性能。

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

在这个示例中，由子查询 `IN (SELECT id FROM t0)` 构建的集合只包含新插入的行，有助于据此对 `t1` 进行过滤。

#### Stack Overflow 示例

参考我们之前的[物化视图示例](/materialized-view/incremental-materialized-view#example)，用于计算**每位用户每天获得的徽章数**，并包含来自 `users` 表的用户显示名称。

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

该视图显著增加了对 `badges` 表的插入延迟，例如：

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

已插入 1 行。耗时：7.517 秒。
```

使用上述方法，我们可以优化这个视图。我们将在 `users` 表上添加一个过滤条件，只保留插入徽章行中出现的用户 ID：

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

这不仅加快了初始徽章数据的插入速度：

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')
```


结果中有 0 行。查询耗时：132.118 秒。已处理 3.2343 亿行，4.69 GB（每秒 245 万行，35.49 MB/秒）。
峰值内存占用：1.99 GiB。

````

但这也意味着未来的徽章插入操作效率很高:

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 0.583 sec.
````

在上述操作中，只针对用户 ID `2936484` 从 `users` 表中检索到一行记录。此查找同样利用表的排序键 `Id` 进行了优化。


## 物化视图与 UNION ALL

`UNION ALL` 查询通常用于将来自多个源表的数据合并为单个结果集。

尽管在增量物化视图中并不直接支持 `UNION ALL`，但可以通过为每个 `SELECT` 分支创建单独的物化视图，并将它们的结果写入同一个目标表，来实现等效的效果。

在本示例中，我们将使用 Stack Overflow 数据集。请看下面的 `badges` 和 `comments` 表，它们分别表示用户获得的徽章以及他们在帖子下发表的评论：

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

假设我们希望创建一个统一的用户活动视图，通过合并这两个表来展示每个用户最近一次的活动：

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

假设我们有一个目标表用于接收此查询的结果。请注意这里使用了 [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) 表引擎和 [AggregateFunction](/sql-reference/data-types/aggregatefunction) 数据类型，以确保结果能够被正确合并：

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

如果希望在向 `badges` 或 `comments` 中插入新行时这个表能够自动更新，那么一个较为天真的做法是尝试使用前面的 union 查询来创建一个物化视图：

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

虽然这在语法上是正确的，但会产生意外结果——该视图只会触发向 `comments` 表的插入操作。例如：

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
```


┌─UserId──┬─description──────┬─activity&#95;type─┬───────────last&#95;activity─┐
│ 2936484 │ 答案是 42        │ comment       │ 2025-04-15 09:56:19.000 │
└─────────┴──────────────────┴───────────────┴─────────────────────────┘

1 行结果，耗时 0.005 秒。

````

向 `badges` 表插入数据不会触发视图,导致 `user_activity` 无法接收更新:

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

返回 1 行。用时:0.005 秒。
````

为了解决这个问题，我们只需为每个 `SELECT` 语句创建一个物化视图：

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

现在向任一表插入数据都会得到正确结果。例如，如果我们向 `comments` 表插入数据：

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
│ 2936484 │ 答案是 42        │ comment       │ 2025-04-15 10:18:47.000 │
└─────────┴──────────────────┴───────────────┴─────────────────────────┘

1 row in set. Elapsed: 0.006 sec.
```

同样，向 `badges` 表插入的数据也会体现在 `user_activity` 表中：

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


## 并行处理与顺序处理

如前面的示例所示，一个表可以作为多个物化视图的源表。这些视图的执行顺序取决于设置 [`parallel_view_processing`](/operations/settings/settings#parallel_view_processing)。

默认情况下，该设置为 `0`（`false`），表示物化视图会按 `uuid` 顺序依次执行。

例如，考虑下面的 `source` 表和 3 个物化视图，每个视图都将行发送到同一个 `target` 表中：

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

请注意，每个视图在向 `target` 表插入各自的行之前都会先暂停 1 秒，同时还会写入视图名称和插入时间。

向 `source` 表插入一行大约需要 3 秒，每个视图按顺序依次执行：

```sql
INSERT INTO source VALUES ('test')

已插入 1 行。耗时：3.786 秒。
```

我们可以通过执行一次 `SELECT` 查询来确认各行是否已写入：

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

共 3 行。用时:0.015 秒。
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

返回了 3 行。耗时：0.004 秒。
```

相反，考虑在启用 `parallel_view_processing=1` 的情况下插入一行数据会发生什么。启用该设置后，视图会并行执行，因此无法保证行到达目标表的先后顺序：

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


尽管我们这里看到来自各个视图的行到达顺序是相同的，但这种顺序并没有任何保证——这一点从各行插入时间非常接近就可以看出。另外，也要注意插入性能已有所提升。

### 何时使用并行处理 {#materialized-views-when-to-use-parallel}

启用 `parallel_view_processing=1` 可以显著提升插入吞吐量，如上所示，尤其是在单个表上挂载了多个物化视图（Materialized View）时。不过，需要理解其中的权衡：

- **插入压力增大**：所有物化视图会同时执行，从而增加 CPU 和内存占用。如果每个视图都执行了大量计算或 JOIN 操作，可能会导致系统过载。
- **对严格执行顺序的需求**：在少见的工作流中，如果视图的执行顺序很重要（例如存在链式依赖时），并行执行可能导致状态不一致或出现竞争条件。虽然可以通过架构设计绕开这些问题，但此类方案较为脆弱，并且可能在未来版本中失效。

:::note 历史默认行为与稳定性
顺序执行在很长一段时间内一直是默认行为，其中一个原因是错误处理比较复杂。从历史上看，一个物化视图中的失败可能会阻止其他视图执行。新版本通过按数据块隔离失败改善了这一点，但顺序执行仍然提供了更清晰的失败语义。
:::

通常情况下，在以下场景可以启用 `parallel_view_processing=1`：

- 你有多个彼此独立的物化视图
- 你希望最大化插入性能
- 你清楚系统具备处理并发视图执行的能力

在以下场景应保持禁用：
- 物化视图之间存在依赖关系
- 你需要可预测、有序的执行
- 你在调试或审计插入行为，并希望获得可确定的重放行为



## 物化视图与公用表表达式（CTE）

物化视图中支持使用**非递归**公用表表达式（CTE）。

:::note 公用表表达式**不会**被物化
ClickHouse 不会物化 CTE；相反，它会将 CTE 的定义直接内联替换到查询中，如果同一个 CTE 被多次使用，这可能会导致对同一表达式进行多次计算。
:::

考虑以下示例，它计算每种帖子类型的每日活动情况。

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
    WHERE Score > 0 AND PostTypeId IN (1, 2)  -- 问题或回答
)
SELECT
    Day,
    CASE PostTypeId
        WHEN 1 THEN '问题'
        WHEN 2 THEN '回答'
    END AS PostType,
    count() AS PostsCreated,
    avgState(Score) AS AvgScore,
    sum(ViewCount) AS TotalViews
FROM filtered_posts
GROUP BY Day, PostTypeId;
```

虽然在这里严格来说不需要使用 CTE，但作为示例，这个视图可以按预期工作：

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

返回 10 行。用时:0.013 秒。处理了 1.145 万行,663.87 KB(86.653 万行/秒,50.26 MB/秒)。
峰值内存使用量:989.53 KiB。
```

在 ClickHouse 中，CTE 会被内联处理，也就是说在优化阶段会被实际“复制粘贴”进查询中，而**不会**被物化。这意味着：

* 如果你的 CTE 引用了与源表（即物化视图所关联的那张表）不同的表，并且在 `JOIN` 或 `IN` 子句中使用，那么它的行为会像子查询或连接（JOIN），而不是触发器。
* 物化视图仍然只会在向主源表插入数据时触发，但 CTE 会在每次插入时重新执行，这可能会带来不必要的开销，尤其是在被引用的表非常大的情况下。

例如，


```sql
WITH recent_users AS (
  SELECT Id FROM stackoverflow.users WHERE CreationDate > now() - INTERVAL 7 DAY
)
SELECT * FROM stackoverflow.posts WHERE OwnerUserId IN (SELECT Id FROM recent_users)
```

在这种情况下，每次向 `posts` 插入数据时都会重新计算 `users` CTE，而在插入新用户时物化视图不会更新——只会在插入帖子时更新。

一般情况下，应将 CTE 用于实现作用于与物化视图关联的同一源表的逻辑，或者确保引用的表较小且不太可能造成性能瓶颈。或者，可以考虑采用[与物化视图 JOIN 相同的优化策略](/materialized-view/incremental-materialized-view#join-best-practices)。
