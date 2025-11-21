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

增量物化视图(Materialized Views)允许用户将计算开销从查询时转移到插入时,从而加快 `SELECT` 查询速度。

与 Postgres 等事务型数据库不同,ClickHouse 物化视图本质上是一个触发器,在数据块插入表时对其执行查询。查询结果会插入到第二个"目标"表中。当插入更多行时,结果将再次发送到目标表,其中的中间结果会被更新和合并。合并后的结果等同于对所有原始数据执行查询所得到的结果。

物化视图的主要优势在于,插入到目标表中的结果代表了对行进行聚合、过滤或转换后的结果。这些结果通常是原始数据的精简表示(在聚合场景下是部分摘要)。这一特性,加上从目标表读取结果的查询非常简单,确保了查询时间比对原始数据执行相同计算要快得多,从而将计算开销(以及查询延迟)从查询时转移到插入时。

ClickHouse 中的物化视图会随着数据流入其所基于的表而实时更新,其功能更像是持续更新的索引。这与其他数据库形成对比,在其他数据库中,物化视图通常是查询的静态快照,必须手动刷新(类似于 ClickHouse 的[可刷新物化视图](/sql-reference/statements/create/view#refreshable-materialized-view))。

<Image
  img={materializedViewDiagram}
  size='md'
  alt='物化视图示意图'
/>


## 示例 {#example}

为了演示目的,我们将使用["模式设计"](/data-modeling/schema-design)中记录的 Stack Overflow 数据集。

假设我们想要获取每个帖子每天的赞成票和反对票数量。

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

得益于 [`toStartOfDay`](/sql-reference/functions/date-time-functions#toStartOfDay) 函数,这在 ClickHouse 中是一个相当简单的查询:

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

得益于 ClickHouse,这个查询已经很快了,但我们能做得更好吗?

如果我们想在插入时使用物化视图来计算这个结果,我们需要一个表来接收结果。该表每天应该只保留 1 行。如果收到现有日期的更新,其他列应该合并到该日期的现有行中。为了实现这种增量状态的合并,必须为其他列存储部分状态。

这需要 ClickHouse 中的一种特殊引擎类型:[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)。它将所有具有相同排序键的行替换为一行,该行包含数值列的求和值。以下表将合并具有相同日期的任何行,对所有数值列求和:

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

为了演示我们的物化视图,假设我们的 votes 表是空的,尚未接收任何数据。我们的物化视图对插入到 `votes` 中的数据执行上述 `SELECT`,并将结果发送到 `up_down_votes_per_day`:

```sql
CREATE MATERIALIZED VIEW up_down_votes_per_day_mv TO up_down_votes_per_day AS
SELECT toStartOfDay(CreationDate)::Date AS Day,
       countIf(VoteTypeId = 2) AS UpVotes,
       countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY Day
```

这里的 `TO` 子句是关键,它指定结果将发送到哪里,即 `up_down_votes_per_day`。


我们可以从之前的插入操作重新填充 votes 表:

```sql
INSERT INTO votes SELECT toUInt32(Id) AS Id, toInt32(PostId) AS PostId, VoteTypeId, CreationDate, UserId, BountyAmount
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/*.parquet')

0 rows in set. Elapsed: 111.964 sec. Processed 477.97 million rows, 3.89 GB (4.27 million rows/s., 34.71 MB/s.)
Peak memory usage: 283.49 MiB.
```

完成后,我们可以确认 `up_down_votes_per_day` 的大小 - 每天应该有 1 行:

```sql
SELECT count()
FROM up_down_votes_per_day
FINAL

┌─count()─┐
│    5723 │
└─────────┘
```

通过存储查询结果,我们有效地将行数从 2.38 亿行(在 `votes` 表中)减少到 5000 行。然而,关键在于如果有新的投票插入到 `votes` 表中,新值将被发送到 `up_down_votes_per_day` 对应的日期,并在后台自动异步合并 - 每天只保留一行。因此 `up_down_votes_per_day` 将始终保持较小的规模且数据是最新的。

由于行的合并是异步的,用户查询时每天可能存在多行。为了确保在查询时合并所有未完成的行,我们有两个选项:

- 在表名上使用 `FINAL` 修饰符。我们在上面的计数查询中使用了这种方法。
- 按最终表中使用的排序键(即 `CreationDate`)进行聚合并对指标求和。通常这种方法更高效和灵活(表可以用于其他用途),但前者对某些查询来说可能更简单。我们在下面展示这两种方法:

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

这将我们的查询速度从 0.133 秒提升到 0.004 秒 - 提升了超过 25 倍!

:::important 重要提示:`ORDER BY` = `GROUP BY`
在大多数情况下,如果使用 `SummingMergeTree` 或 `AggregatingMergeTree` 表引擎,物化视图转换中 `GROUP BY` 子句使用的列应与目标表的 `ORDER BY` 子句中使用的列保持一致。这些引擎依赖 `ORDER BY` 列在后台合并操作期间合并具有相同值的行。`GROUP BY` 和 `ORDER BY` 列之间的不一致可能导致查询性能低下、合并效果不佳,甚至数据不一致。
:::

### 更复杂的示例 {#a-more-complex-example}


上面的示例使用物化视图（Materialized View）来计算并维护每天的两个求和值。求和是维护部分聚合状态最简单的形式——当有新值到达时，我们只需将新值加到已有值上即可。不过，ClickHouse 的物化视图可以用于任意类型的聚合。

假设我们希望为每天的帖子计算一些统计信息：`Score` 的第 99.9 百分位数，以及 `CommentCount` 的平均值。用于计算这一结果的查询可能如下所示：

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

与之前一样，我们可以创建一个物化视图，在有新的帖子插入到我们的 `posts` 表时执行上述查询。

作为示例，并为了避免从 S3 加载帖子数据，我们将创建一个与 `posts` 具有相同表结构的表 `posts_null`。不过，该表不会存储任何数据，只会在插入行时供物化视图使用。为避免实际存储数据，我们可以使用 [`Null` 表引擎类型](/engines/table-engines/special/null)。

```sql
CREATE TABLE posts_null AS posts ENGINE = Null
```

Null 表引擎是一种强大的优化手段——可以把它看作 `/dev/null`。当我们的 `posts_null` 表在插入阶段接收数据行时，我们的物化视图会计算并存储汇总统计信息——它本身只是一个触发器。而原始数据并不会被存储。尽管在本例中，我们很可能仍然希望保留原始帖子，但这种方法可以用来计算聚合，同时避免存储原始数据所带来的额外开销。

物化视图因此变为：

```sql
CREATE MATERIALIZED VIEW post_stats_mv TO post_stats_per_day AS
       SELECT toStartOfDay(CreationDate) AS Day,
       quantileState(0.999)(Score) AS Score_quantiles,
       avgState(CommentCount) AS AvgCommentCount
FROM posts_null
GROUP BY Day
```

请注意我们如何在聚合函数的末尾追加后缀 `State`。这样可以确保返回的是该函数的聚合状态，而不是最终结果。该状态将包含额外的信息，使这个部分状态可以与其他状态进行合并。例如，对于求平均值的情况，其中会包含该列的计数和值的总和。

> 部分聚合状态对于计算正确的结果是必需的。例如，在计算平均值时，仅仅对各子区间的平均值再求平均会产生不正确的结果。

现在我们为视图 `post_stats_per_day` 创建目标表，用于存储这些部分聚合状态：


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

虽然之前使用 `SummingMergeTree` 足以存储计数，但对于其他函数，我们需要一种更高级的引擎类型：[`AggregatingMergeTree`](/engines/table-engines/mergetree-family/aggregatingmergetree)。
为确保 ClickHouse 知道将要存储聚合状态，我们将 `Score_quantiles` 和 `AvgCommentCount` 定义为 `AggregateFunction` 类型，并指定这些部分聚合状态所对应的聚合函数以及其源列的类型。与 `SummingMergeTree` 类似，具有相同 `ORDER BY` 键值的行将会被合并（在上面的示例中为 `Day`）。

为了通过物化视图填充我们的 `post_stats_per_day`，我们只需将 `posts` 中的所有行插入到 `posts_null` 中：

```sql
INSERT INTO posts_null SELECT * FROM posts

返回 0 行。用时:13.329 秒。已处理 1.1964 亿行,76.99 GB(898 万行/秒,5.78 GB/秒)
```

> 在生产环境中，你很可能会将物化视图关联到 `posts` 表。我们在这里使用 `posts_null` 是为了演示 Null 表。

我们的最终查询需要在函数名中使用 `Merge` 后缀（因为这些列存储的是部分聚合状态值）：

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

注意，这里我们使用 `GROUP BY`，而不是使用 `FINAL`。


## 其他应用 {#other-applications}

上述内容主要介绍如何使用物化视图增量更新数据的部分聚合结果,从而将计算从查询时转移到插入时。除了这个常见用例之外,物化视图还有许多其他应用场景。

### 过滤和转换 {#filtering-and-transformation}

在某些情况下,我们可能希望在插入时仅插入部分行和列。此时,我们的 `posts_null` 表可以接收插入操作,通过 `SELECT` 查询在插入到 `posts` 表之前对行进行过滤。例如,假设我们希望转换 `posts` 表中的 `Tags` 列。该列包含以管道符分隔的标签名称列表。通过将其转换为数组,我们可以更方便地按单个标签值进行聚合。

> 我们可以在运行 `INSERT INTO SELECT` 时执行此转换。物化视图允许我们将此逻辑封装在 ClickHouse DDL 中,并保持 `INSERT` 语句的简洁性,转换将自动应用于所有新插入的行。

用于此转换的物化视图如下所示:

```sql
CREATE MATERIALIZED VIEW posts_mv TO posts AS
        SELECT * EXCEPT Tags, arrayFilter(t -> (t != ''), splitByChar('|', Tags)) as Tags FROM posts_null
```

### 查找表 {#lookup-table}

用户在选择 ClickHouse 排序键时应考虑其访问模式。应优先使用在过滤和聚合子句中频繁使用的列。但对于用户具有更多样化访问模式且无法用单一列集合来概括的场景,这种方式可能会有所限制。例如,考虑以下 `comments` 表:

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

此处的排序键针对按 `PostId` 过滤的查询进行了优化。

假设用户希望按特定的 `UserId` 进行过滤并计算其平均 `Score`:

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

虽然速度很快(对于 ClickHouse 来说数据量较小),但从处理的行数(9038 万行)可以看出这需要进行全表扫描。对于更大的数据集,我们可以使用物化视图来查找过滤列 `UserId` 对应的排序键值 `PostId`。然后可以使用这些值执行高效的查找操作。

在此示例中,我们的物化视图可以非常简单,在插入时仅从 `comments` 中选择 `PostId` 和 `UserId`。这些结果随后被发送到按 `UserId` 排序的 `comments_posts_users` 表。我们在下面创建 `Comments` 表的 Null 引擎版本,并使用它来填充我们的视图和 `comments_posts_users` 表:

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

现在我们可以在子查询中使用此视图来加速之前的查询:

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


1 行记录。耗时: 0.012 秒。已处理 88.61 千行，771.37 KB（7.09 百万行/秒，61.73 MB/秒）。

```

### 链式/级联物化视图 {#chaining}

物化视图可以进行链式连接(或级联),以构建复杂的工作流。
更多信息请参阅指南["级联物化视图"](https://clickhouse.com/docs/guides/developer/cascading-materialized-views)。
```


## 物化视图与 JOIN {#materialized-views-and-joins}

:::note 可刷新物化视图
以下内容仅适用于增量物化视图。可刷新物化视图会定期对完整目标数据集执行查询,并完全支持 JOIN 操作。如果可以接受结果新鲜度的降低,请考虑使用它们来处理复杂的 JOIN 操作。
:::

ClickHouse 中的增量物化视图完全支持 `JOIN` 操作,但有一个关键约束:**物化视图仅在向源表(查询中最左侧的表)插入数据时触发。** JOIN 中的右侧表不会触发更新,即使其数据发生变化。在构建**增量**物化视图时,这种行为尤为重要,因为数据是在插入时进行聚合或转换的。

当使用 `JOIN` 定义增量物化视图时,`SELECT` 查询中最左侧的表充当源表。当向该表插入新行时,ClickHouse _仅_使用这些新插入的行执行物化视图查询。在此执行过程中,JOIN 中的右侧表会被完整读取,但仅对右侧表的更改不会触发视图。

这种行为使得物化视图中的 JOIN 类似于针对静态维度数据的快照连接。

这非常适合使用参考表或维度表来丰富数据。但是,对右侧表的任何更新(例如用户元数据)都不会追溯更新物化视图。要查看更新后的数据,必须向源表插入新数据。

### 示例 {#materialized-views-and-joins-example}

让我们通过使用 [Stack Overflow 数据集](/data-modeling/schema-design)的具体示例来演示。我们将使用物化视图来计算**每个用户的每日徽章数**,包括从 `users` 表中获取的用户显示名称。

作为提醒,我们的表结构如下:

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

我们假设 `users` 表已预先填充:

```sql
INSERT INTO users
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/users.parquet');
```

物化视图及其关联的目标表定义如下:

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
物化视图中的 `GROUP BY` 子句必须包含 `DisplayName`、`UserId` 和 `Day`,以匹配 `SummingMergeTree` 目标表中的 `ORDER BY`。这确保行被正确聚合和合并。省略其中任何一个都可能导致结果不正确或合并效率低下。
:::

如果我们现在填充徽章数据,视图将被触发,从而填充我们的 `daily_badges_by_user` 表。

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 433.762 sec. Processed 1.16 billion rows, 28.50 GB (2.67 million rows/s., 65.70 MB/s.)
```

假设我们希望查看特定用户获得的徽章,我们可以编写以下查询:


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

现在，如果该用户获得新的徽章并插入一行记录，我们的视图就会更新：

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

返回 1 行。用时:7.517 秒。

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

返回 9 行。用时:0.017 秒。已处理 32.77 千行,642.27 KB(196 万行/秒,38.50 MB/秒)。
```

:::warning
注意此处写入的延迟。插入的用户行将与整个 `users` 表进行 JOIN，显著影响插入性能。我们在下面的 [&quot;在过滤和 JOIN 中使用源表&quot;](/materialized-view/incremental-materialized-view#using-source-table-in-filters-and-joins-in-materialized-views) 一节中给出了应对该问题的方法。
:::

相反，如果我们先为新用户插入一条 badge 记录，然后再插入该用户的行，我们的物化视图将无法捕获该用户的指标数据。

```sql
INSERT INTO badges VALUES (53505059, 23923286, '优秀回答', now(), '铜牌', 0);
INSERT INTO users VALUES (23923286, 1, now(),  'brand_new_user', now(), 'UK', 1, 1, 0);
```


```sql
SELECT *
FROM daily_badges_by_user
FINAL
WHERE DisplayName = 'brand_new_user';

0 rows in set. Elapsed: 0.017 sec. Processed 32.77 thousand rows, 644.32 KB (1.98 million rows/s., 38.94 MB/s.)
```

在这种情况下,视图仅在用户行存在之前执行徽章插入操作。如果我们为该用户插入另一个徽章,则会按预期插入一行:

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

但是请注意,此结果是不正确的。

### 物化视图中 JOIN 的最佳实践 {#join-best-practices}

- **使用最左侧的表作为触发器。** 只有 `SELECT` 语句左侧的表才会触发物化视图。右侧表的更改不会触发更新。

- **预先插入关联数据。** 在向源表插入行之前,确保关联表中的数据已存在。JOIN 在插入时进行评估,因此缺失的数据将导致不匹配的行或空值。

- **限制从关联中提取的列。** 仅从关联表中选择所需的列,以最小化内存使用并减少插入时延迟(见下文)。

- **评估插入时性能。** JOIN 会增加插入的成本,特别是对于大型右侧表。使用具有代表性的生产数据对插入速率进行基准测试。

- **对于简单查找优先使用字典。** 使用[字典](/dictionary)进行键值查找(例如,用户 ID 到名称),以避免昂贵的 JOIN 操作。

- **对齐 `GROUP BY` 和 `ORDER BY` 以提高合并效率。** 使用 `SummingMergeTree` 或 `AggregatingMergeTree` 时,确保 `GROUP BY` 与目标表中的 `ORDER BY` 子句匹配,以实现高效的行合并。

- **使用显式列别名。** 当表具有重叠的列名时,使用别名以防止歧义并确保目标表中的结果正确。

- **考虑插入量和频率。** JOIN 在中等插入工作负载中表现良好。对于高吞吐量数据摄取,考虑使用暂存表、预关联或其他方法,例如字典和[可刷新物化视图](/materialized-view/refreshable-materialized-view)。

### 在过滤器和关联中使用源表 {#using-source-table-in-filters-and-joins-in-materialized-views}

在 ClickHouse 中使用物化视图时,了解在执行物化视图查询期间如何处理源表非常重要。具体来说,物化视图查询中的源表会被插入的数据块替换。如果不正确理解此行为,可能会导致一些意外结果。

#### 示例场景 {#example-scenario}

考虑以下设置:

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

在上述示例中,我们有两个物化视图 `mvw1` 和 `mvw2`,它们执行类似的操作,但在引用源表 `t0` 的方式上略有不同。

在 `mvw1` 中,表 `t0` 直接在 JOIN 右侧的 `(SELECT * FROM t0)` 子查询中被引用。当数据插入到 `t0` 时,物化视图的查询会被执行,插入的数据块将替换 `t0`。这意味着 JOIN 操作仅对新插入的行执行,而不是对整个表执行。

在第二种情况下,与 `vt0` 进行连接时,视图会读取 `t0` 中的所有数据。这确保 JOIN 操作会考虑 `t0` 中的所有行,而不仅仅是新插入的数据块。

关键区别在于 ClickHouse 如何处理物化视图查询中的源表。当物化视图被插入操作触发时,源表(在本例中为 `t0`)会被插入的数据块替换。这种行为可以用来优化查询,但也需要仔细考虑以避免出现意外结果。

### 使用场景和注意事项 {#use-cases-and-caveats}

在实践中,您可以利用这种行为来优化只需要处理源表部分数据的物化视图。例如,您可以使用子查询在与其他表连接之前过滤源表。这有助于减少物化视图处理的数据量并提高性能。

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

在此示例中,从 `IN (SELECT id FROM t0)` 子查询构建的集合仅包含新插入的行,这有助于用它来过滤 `t1`。

#### Stack Overflow 示例 {#example-with-stack-overflow}

考虑我们[之前的物化视图示例](/materialized-view/incremental-materialized-view#example),用于计算**每个用户的每日徽章数**,包括从 `users` 表中获取的用户显示名称。

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

此视图显著影响了 `badges` 表的插入延迟,例如:

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 7.517 sec.
```

使用上述方法,我们可以优化此视图。我们将使用插入的徽章行中的用户 ID 向 `users` 表添加过滤器:

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

这不仅加快了初始徽章插入的速度:

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

```


0 行记录。耗时：132.118 秒。已处理 3.2343 亿行，4.69 GB（245 万行/秒，35.49 MB/秒）。
峰值内存使用量：1.99 GiB。

````

这也意味着未来的徽章插入操作将会很高效：

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

返回 1 行。耗时：0.583 秒。
````

在上述操作中，只从 `users` 表中检索到一行用户 ID 为 `2936484` 的记录。该查找还利用表的排序键 `Id` 进行了优化。


## 物化视图与联合查询 {#materialized-views-and-unions}

`UNION ALL` 查询通常用于将多个源表的数据合并到单个结果集中。

虽然增量物化视图不直接支持 `UNION ALL`,但您可以通过为每个 `SELECT` 分支创建单独的物化视图并将其结果写入共享目标表来实现相同的效果。

在我们的示例中,我们将使用 Stack Overflow 数据集。考虑以下 `badges` 和 `comments` 表,它们分别表示用户获得的徽章和用户对帖子发表的评论:

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

可以使用以下 `INSERT INTO` 命令填充这些表:

```sql
INSERT INTO stackoverflow.badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')
INSERT INTO stackoverflow.comments SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/comments/*.parquet')
```

假设我们想要创建一个统一的用户活动视图,通过合并这两个表来显示每个用户的最后活动:

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

假设我们有一个目标表来接收此查询的结果。注意使用 [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) 表引擎和 [AggregateFunction](/sql-reference/data-types/aggregatefunction) 以确保结果正确合并:

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

如果希望在向 `badges` 或 `comments` 插入新行时更新此表,解决此问题的一个简单方法可能是尝试使用前面的联合查询创建物化视图:

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

虽然这在语法上是有效的,但它会产生意外的结果 - 该视图只会触发对 `comments` 表的插入。例如:

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

结果中有 1 行。耗时：0.005 秒。

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

1 row in set. Elapsed: 0.005 sec.
````

为了解决这个问题，我们可以为每条 SELECT 语句分别创建一个物化视图：

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

现在向任一表中插入数据都会得到正确的结果。例如，如果我们向 `comments` 表中插入数据：

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
│ 2936484 │ The answer is 42 │ 评论       │ 2025-04-15 10:18:47.000 │
└─────────┴──────────────────┴───────────────┴─────────────────────────┘

返回 1 行。用时:0.006 秒。
```

同样，向 `badges` 表插入的数据会体现在 `user_activity` 表中：

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

如前面的示例所示,一个表可以作为多个物化视图的源表。这些物化视图的执行顺序取决于 [`parallel_view_processing`](/operations/settings/settings#parallel_view_processing) 设置。

默认情况下,此设置为 `0`(`false`),表示物化视图按 `uuid` 顺序依次执行。

例如,考虑以下 `source` 表和 3 个物化视图,每个视图都将行发送到 `target` 表:

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

请注意,每个视图在将行插入到 `target` 表之前都会暂停 1 秒,同时还会记录视图名称和插入时间。

向 `source` 表插入一行大约需要 3 秒,每个视图依次执行:

```sql
INSERT INTO source VALUES ('test')

1 row in set. Elapsed: 3.786 sec.
```

我们可以通过 `SELECT` 确认每个视图的行到达情况:

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

这与视图的 `uuid` 顺序一致:

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

相反,如果启用 `parallel_view_processing=1` 后插入一行,情况会有所不同。启用此设置后,视图将并行执行,不保证行到达目标表的顺序:

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


尽管我们从每个视图接收到的行的顺序相同,但这并不能保证——正如每行插入时间的相似性所示。另外请注意插入性能的提升。

### 何时使用并行处理 {#materialized-views-when-to-use-parallel}

如上所示,启用 `parallel_view_processing=1` 可以显著提高插入吞吐量,尤其是当多个物化视图附加到单个表时。但是,理解其权衡取舍非常重要:

- **增加插入压力**:所有物化视图同时执行,会增加 CPU 和内存使用量。如果每个视图执行繁重的计算或 JOIN 操作,可能会导致系统过载。
- **需要严格的执行顺序**:在少数需要视图执行顺序的工作流中(例如链式依赖),并行执行可能导致状态不一致或竞态条件。虽然可以围绕此问题进行设计,但这种设置较为脆弱,可能在未来版本中失效。

:::note 历史默认值和稳定性
顺序执行长期以来一直是默认设置,部分原因是错误处理的复杂性。从历史上看,一个物化视图的失败可能会阻止其他视图执行。较新版本通过按数据块隔离失败来改进了这一点,但顺序执行仍然提供更清晰的失败语义。
:::

通常,在以下情况下启用 `parallel_view_processing=1`:

- 您有多个独立的物化视图
- 您的目标是最大化插入性能
- 您了解系统处理并发视图执行的能力

在以下情况下保持禁用:

- 物化视图之间存在相互依赖关系
- 您需要可预测的有序执行
- 您正在调试或审计插入行为,并希望进行确定性重放


## 物化视图与公用表表达式 (CTE) {#materialized-views-common-table-expressions-ctes}

物化视图支持**非递归**公用表表达式 (CTE)。

:::note 公用表表达式**不会**被物化
ClickHouse 不会物化 CTE;而是将 CTE 定义直接替换到查询中,如果 CTE 被多次使用,可能导致同一表达式被多次求值。
:::

以下示例计算每种帖子类型的每日活动情况。

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

虽然此处并非必须使用 CTE,但为了演示目的,该视图将按预期工作:

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

在 ClickHouse 中,CTE 是内联的,这意味着它们在优化期间被直接嵌入到查询中,而**不会**被物化。这意味着:

- 如果您的 CTE 引用的表与源表(即物化视图所附加的表)不同,并且在 `JOIN` 或 `IN` 子句中使用,它将表现为子查询或连接,而不是触发器。
- 物化视图仍然只会在向主源表插入数据时触发,但 CTE 将在每次插入时重新执行,这可能会造成不必要的开销,尤其是当引用的表较大时。

例如,


```sql
WITH recent_users AS (
  SELECT Id FROM stackoverflow.users WHERE CreationDate > now() - INTERVAL 7 DAY
)
SELECT * FROM stackoverflow.posts WHERE OwnerUserId IN (SELECT Id FROM recent_users)
```

在这种情况下，users 的 CTE 会在每次向 posts 插入数据时重新计算，而当有新用户插入时，物化视图不会更新——只会在有新的 posts 时才更新。

通常，应将 CTE 用于作用在与物化视图所关联的源表上的逻辑，或者确保被引用的表较小且不太可能导致性能瓶颈。或者，可以考虑采用[与物化视图 JOIN 相同的优化](/materialized-view/incremental-materialized-view#join-best-practices)。
