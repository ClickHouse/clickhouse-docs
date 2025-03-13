---
slug: /materialized-view/incremental-materialized-view
title: 增量物化视图
description: 如何使用增量物化视图加快查询速度
keywords: [增量物化视图, 加快查询, 查询优化]
score: 10000
---

import materializedViewDiagram from '@site/static/images/materialized-view/materialized-view-diagram.png';


# 增量物化视图

增量物化视图（Materialized Views）允许用户将计算成本从查询时间转移到插入时间，从而加快 `SELECT` 查询的速度。

与 PostgreSQL 等事务型数据库不同，在 ClickHouse 中，物化视图只是一个触发器，它在数据块插入到表时运行查询。该查询的结果插入到第二个“目标”表中。如果插入更多行，结果将再次发送到目标表，其中临时结果将被更新和合并。此合并结果等同于对所有原始数据运行查询。

物化视图的主要动机是，插入到目标表的结果表示对行的聚合、过滤或转换的结果。这些结果通常会比原始数据更小（在聚合的情况下为部分草图）。这使得从目标表读取结果的查询变得简单，确保查询时间比在原始数据上执行相同计算时要快，将计算（因此查询延迟）从查询时间转移到插入时间。

在 ClickHouse 中，物化视图是在数据流入其基础表时实时更新，功能更像是不断更新的索引。这与其他数据库中的物化视图通常是静态快照，必须刷新（类似于 ClickHouse 的 [可刷新的物化视图](/sql-reference/statements/create/view#refreshable-materialized-view)）形成对比。

<img src={materializedViewDiagram}
     class="image"
     alt="物化视图图示"
     style={{width: '500px'}} />

## 示例 {#example}

假设我们想获得一篇文章每天的点赞和点踩数量。

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

由于 ClickHouse 的 [`toStartOfDay`](/sql-reference/functions/date-time-functions#tostartofday) 函数，这个查询相对简单：

```sql
SELECT toStartOfDay(CreationDate) AS day,
       countIf(VoteTypeId = 2) AS UpVotes,
       countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY day
ORDER BY day ASC
LIMIT 10

┌─────────────────day─┬─UpVotes─┬─DownVotes─┐
│ 2008-07-31 00:00:00 │   	6 │     	0 │
│ 2008-08-01 00:00:00 │ 	182 │    	50 │
│ 2008-08-02 00:00:00 │ 	436 │   	107 │
│ 2008-08-03 00:00:00 │ 	564 │   	100 │
│ 2008-08-04 00:00:00 │	1306 │   	259 │
│ 2008-08-05 00:00:00 │	1368 │   	269 │
│ 2008-08-06 00:00:00 │	1701 │   	211 │
│ 2008-08-07 00:00:00 │	1544 │   	211 │
│ 2008-08-08 00:00:00 │	1241 │   	212 │
│ 2008-08-09 00:00:00 │ 	576 │    	46 │
└─────────────────────┴─────────┴───────────┘

10 rows in set. Elapsed: 0.133 sec. Processed 238.98 million rows, 2.15 GB (1.79 billion rows/s., 16.14 GB/s.)
Peak memory usage: 363.22 MiB.
```

这个查询由于 ClickHouse 的原因已经很快了，但我们能做得更好么？

如果我们希望在插入时使用物化视图来计算此数据，则需要一个接收结果的表。该表应该只保留每天 1 行记录。如果收到对已存在日期的更新，其他列应该合并到该日期的现有行中。为了实现这种增量状态的合并，必须为其他列存储部分状态。

这需要 ClickHouse 中一种特殊的引擎类型：[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)。这将所有具有相同排序键的行替换为一行，该行包含数值列的总和。以下表将合并任何具有相同日期的行，并对任何数值列求和：

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

为了演示我们的物化视图，假设我们的 votes 表为空，尚未接收任何数据。我们的物化视图对插入到 votes 的数据执行上述 `SELECT`，其结果发送到 `up_down_votes_per_day`：

```sql
CREATE MATERIALIZED VIEW up_down_votes_per_day_mv TO up_down_votes_per_day AS
SELECT toStartOfDay(CreationDate)::Date AS Day,
       countIf(VoteTypeId = 2) AS UpVotes,
       countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY Day
```

此处的 `TO` 子句是关键，它表示结果将发送到哪里，即 `up_down_votes_per_day`。

我们可以从之前的插入重新填充 votes 表：

```sql
INSERT INTO votes SELECT toUInt32(Id) AS Id, toInt32(PostId) AS PostId, VoteTypeId, CreationDate, UserId, BountyAmount
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/*.parquet')

0 rows in set. Elapsed: 111.964 sec. Processed 477.97 million rows, 3.89 GB (4.27 million rows/s., 34.71 MB/s.)
Peak memory usage: 283.49 MiB.
```

完成后，我们可以确认 `up_down_votes_per_day` 的大小——我们应每天有 1 行记录：

```sql
SELECT count()
FROM up_down_votes_per_day
FINAL

┌─count()─┐
│	5723 │
└─────────┘
```

我们实际上将行数从 2.38 亿（在 `votes` 中）减少到 5000 通过存储我们的查询结果。然而，关键在于，如果新的投票被插入到 `votes` 表中，则新值将被发送到 `up_down_votes_per_day` 的相应日期，在那里将被异步合并到后台，始终只保留一天的一行记录。因此， `up_down_votes_per_day` 将始终保持小且最新。

由于行的合并是异步的，当用户查询时，某一天可能有多于一条投票。为了确保在查询时合并任何未完成的行，我们有两个选择：

- 在表名上使用 `FINAL` 修饰符。我们在上面的计数查询中做了这件事。
- 按我们最终表中使用的排序键进行聚合，即 `CreationDate` 并对度量进行求和。通常这种方式更有效且灵活（该表可以用于其他用途），但前者对某些查询可能更简单。我们在下面展示了两者：

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
│ 2008-07-31 │   	6 │     	0 │
│ 2008-08-01 │ 	182 │    	50 │
│ 2008-08-02 │ 	436 │   	107 │
│ 2008-08-03 │ 	564 │   	100 │
│ 2008-08-04 │	1306 │   	259 │
│ 2008-08-05 │	1368 │   	269 │
│ 2008-08-06 │	1701 │   	211 │
│ 2008-08-07 │	1544 │   	211 │
│ 2008-08-08 │	1241 │   	212 │
│ 2008-08-09 │ 	576 │    	46 │
└────────────┴─────────┴───────────┘

10 rows in set. Elapsed: 0.010 sec. Processed 8.97 thousand rows, 89.68 KB (907.32 thousand rows/s., 9.07 MB/s.)
Peak memory usage: 567.61 KiB.
```

这将我们的查询时间从 0.133s 加速到 0.004s——提升了超过 25 倍！

:::important 重要提示: `ORDER BY` = `GROUP BY`
在大多数情况下，物化视图转换中 `GROUP BY` 子句使用的列应与目标表中 `ORDER BY` 子句使用的列一致，如果使用 `SummingMergeTree` 或 `AggregatingMergeTree` 表引擎的话。这些引擎依赖 `ORDER BY` 列在后台合并操作期间合并相同值的行。`GROUP BY` 和 `ORDER BY` 列之间的不对齐可能会导致查询性能不佳、合并不理想，甚至数据不一致。
:::

### 更复杂的示例 {#a-more-complex-example}

上述示例使用物化视图来计算并维护每天的两个总和。总和代表了维护部分状态的最简单聚合形式——我们可以在新值到达时简单地将其添加到现有值中。然而，ClickHouse 的物化视图可以用于任何聚合类型。

假设我们希望计算每一天帖子的一些统计数据：`Score` 的 99.9 分位数和 `CommentCount` 的平均值。计算此内容的查询可能如下所示：

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
 1. │ 2024-03-31 00:00:00 │  5.23700000000008 │ 1.3429811866859624 │
 2. │ 2024-03-30 00:00:00 │             	5 │ 1.3097158891616976 │
 3. │ 2024-03-29 00:00:00 │  5.78899999999976 │ 1.2827635327635327 │
 4. │ 2024-03-28 00:00:00 │             	7 │  1.277746158224246 │
 5. │ 2024-03-27 00:00:00 │ 5.738999999999578 │ 1.2113264918282023 │
 6. │ 2024-03-26 00:00:00 │             	6 │ 1.3097536945812809 │
 7. │ 2024-03-25 00:00:00 │             	6 │ 1.2836721018539201 │
 8. │ 2024-03-24 00:00:00 │ 5.278999999999996 │ 1.2931667891256429 │
 9. │ 2024-03-23 00:00:00 │ 6.253000000000156 │  1.334061135371179 │
10. │ 2024-03-22 00:00:00 │ 9.310999999999694 │ 1.2388059701492538 │
	└─────────────────────┴───────────────────┴────────────────────┘

10 rows in set. Elapsed: 0.113 sec. Processed 59.82 million rows, 777.65 MB (528.48 million rows/s., 6.87 GB/s.)
Peak memory usage: 658.84 MiB.
```

和之前一样，我们可以创建一个物化视图，它在新帖子插入 `posts` 表时执行上述查询。

为了示例，并避免从 S3 加载帖子数据，我们将创建一个与 `posts` 相同模式的重复表 `posts_null`。但是，这个表将不存储任何数据，仅在插入行时被物化视图使用。为了防止数据存储，我们可以使用 [`Null` 表引擎类型](/engines/table-engines/special/null)。

```sql
CREATE TABLE posts_null AS posts ENGINE = Null
```

Null 表引擎是一种强大的优化——可以将其视为 `/dev/null`。我们的物化视图将在 `posts_null` 表在插入时收到行时计算并存储我们的汇总统计信息——它仅是一个触发器。然而，原始数据将不会被存储。虽然在我们的案例中，我们可能仍希望存储原始帖子，但这种方法可以在避免原始数据存储开销的同时计算聚合。

因此，物化视图变为：

```sql
CREATE MATERIALIZED VIEW post_stats_mv TO post_stats_per_day AS
       SELECT toStartOfDay(CreationDate) AS Day,
       quantileState(0.999)(Score) AS Score_quantiles,
       avgState(CommentCount) AS AvgCommentCount
FROM posts_null
GROUP BY Day
```

请注意，我们在聚合函数结尾添加了后缀 `State`。这确保返回函数的聚合状态，而不是最终结果。它将包含额外的信息，以允许该部分状态与其他状态合并。例如，在计算平均值的情况下，这将包含列的计数和总和。

> 部分聚合状态在计算正确结果时是必需的。例如，对于计算平均值，简单地对子区间的平均值进行求平均会导致不正确的结果。

现在我们创建该视图的目标表 `post_stats_per_day`，用以存储这些部分聚合状态：

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

之前 `SummingMergeTree` 足以存储计数，对于其他函数我们需要更高级的引擎类型：[`AggregatingMergeTree`](/engines/table-engines/mergetree-family/aggregatingmergetree)。为了确保 ClickHouse 知道将存储聚合状态，我们将 `Score_quantiles` 和 `AvgCommentCount` 定义为类型 `AggregateFunction`，指定部分状态的函数源和它们的源列的类型。与 `SummingMergeTree` 一样，具有相同 `ORDER BY` 键值的行将被合并（在以上示例中为 `Day`）。

通过物化视图填充我们的 `post_stats_per_day`，我们可以简单地从 `posts` 插入所有行到 `posts_null`：

```sql
INSERT INTO posts_null SELECT * FROM posts

0 rows in set. Elapsed: 13.329 sec. Processed 119.64 million rows, 76.99 GB (8.98 million rows/s., 5.78 GB/s.)
```

> 在生产环境中，您可能会将物化视图附加到 `posts` 表。我们在此处使用 `posts_null` 是为了演示 null 表。

我们的最终查询需要利用后缀 `Merge` 来执行我们的函数（因为列存储部分聚合状态）：

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

注意我们在这里使用 `GROUP BY`，而不是使用 `FINAL`。

## 在物化视图中使用源表的过滤器和连接 {#using-source-table-in-filters-and-joins-in-materialized-views}

在使用 ClickHouse 中的物化视图时，了解源表在物化视图查询执行过程中的处理方式非常重要。具体来说，物化视图查询中的源表将被插入的数据块替换。如果未适当理解，这种行为可能会导致一些意外的结果。

### 示例场景 {#example-scenario}

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
1. │  3 │
2. │  5 │
   └────┘

SELECT * FROM mvw2;
   ┌─c0─┐
1. │  3 │
2. │  8 │
   └────┘
```

### 解释 {#explanation}

在上述示例中，我们有两个物化视图 `mvw1` 和 `mvw2`，它们执行相似的操作，但在引用源表 `t0` 的方式上有些许不同。

在 `mvw1` 中，表 `t0` 直接在 JOIN 的右侧通过 `(SELECT * FROM t0)` 子查询引用。当数据插入到 `t0` 时，物化视图的查询使用插入的数据块替换 `t0`。这意味着 JOIN 操作仅在新插入的行上执行，而不是整张表。

在第二种情况下，连接 `vt0`，视图读取 `t0` 的所有数据。这确保 JOIN 操作考虑到 `t0` 中的所有行，而不仅仅是新插入的数据块。

### 为什么会这样 {#why-this-works-like-that}

关键的区别在于 ClickHouse 如何处理物化视图查询中的源表。当通过插入触发物化视图时，源表（在本例中为 `t0`）被插入的数据块替换。这一行为可以被利用来优化查询，但也需要仔细考虑，以避免意外结果。

### 使用场景和注意事项 {#use-cases-and-caveats}

在实践中，您可以利用这种行为优化只需要处理源表数据子集的物化视图。例如，您可以使用子查询在将源表与其他表连接之前过滤源表。这可以帮助减少物化视图处理的数据量，提高性能。

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

在这个例子中，从 `IN (SELECT id FROM t0)` 子查询中构建的集合仅包括新插入的行，这可以帮助对 `t1` 进行过滤。

## 其他应用 {#other-applications}

上述内容主要集中在使用物化视图增量更新时间的数据部分聚合，从而将计算从查询时间转移到插入时间。除了这个常见用例外，物化视图还有许多其他应用。

### 过滤和转换 {#filtering-and-transformation}

在某些情况下，我们可能希望在插入时仅插入行和列的子集。在这种情况下，我们的 `posts_null` 表可以接收插入，其中的 `SELECT` 查询在插入到 `posts` 表之前对行进行过滤。例如，假设我们希望转换 `posts` 表中的 `Tags` 列。这包含一个用管道分隔的标签名称列表。通过将这些转换为数组，我们可以更便捷地按单个标签值聚合。

> 我们可以在执行 `INSERT INTO SELECT` 时执行此转换。物化视图允许我们将此逻辑封装在 ClickHouse DDL 中，并保持我们的 `INSERT` 操作简单，转换应用于任何新行。

我们的物化视图用于此转换如下所示：

```sql
CREATE MATERIALIZED VIEW posts_mv TO posts AS
   	SELECT * EXCEPT Tags, arrayFilter(t -> (t != ''), splitByChar('|', Tags)) as Tags FROM posts_null
```

### 查找表 {#lookup-table}

用户在选择 ClickHouse 排序键时应考虑其访问模式，频繁用于过滤和聚合的列应被使用。这可能对访问模式比较多样化的场景有限制，这些场景无法以单个列集进行封装。例如，考虑以下 `comments` 表：

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

这里的排序键优化了按 `PostId` 过滤查询的表。

假设用户希望针对特定 `UserId` 过滤并计算其平均 `Score`：

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
1. │ 0.18181818181818182 │
   └─────────────────────┘

1 row in set. Elapsed: 0.778 sec. Processed 90.38 million rows, 361.59 MB (116.16 million rows/s., 464.74 MB/s.)
Peak memory usage: 217.08 MiB.
```

虽然执行速度较快（点击库数据较小），但根据处理的行数我们可以看出这需要全表扫描——90.38 万行。对于更大的数据集，我们可以使用物化视图查找排序键值 `PostId` 以过滤 `UserId` 列。这些值可以用于执行高效的查找。

在此示例中，我们的物化视图可以非常简单，仅选择 `comments` 中的 `PostId` 和 `UserId`。在插入时，这些结果被发送到一个按 `UserId` 排序的表 `comments_posts_users`。我们在这里创建一个 `Comments` 表的 null 版本，并使用它来填充我们的视图和 `comments_posts_users` 表：

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

我们现在可以在子查询中使用这个视图来加速之前的查询：

```sql
SELECT avg(Score)
FROM comments
WHERE PostId IN (
	SELECT PostId
	FROM comments_posts_users
	WHERE UserId = 8592047
) AND UserId = 8592047


   ┌──────────avg(Score)─┐
1. │ 0.18181818181818182 │
   └─────────────────────┘

1 row in set. Elapsed: 0.012 sec. Processed 88.61 thousand rows, 771.37 KB (7.09 million rows/s., 61.73 MB/s.)
```

### 链接 {#chaining}

物化视图可以链接，从而建立复杂的工作流。对于实际示例，我们建议阅读这篇 [博客文章](https://clickhouse.com/blog/chaining-materialized-views)。
