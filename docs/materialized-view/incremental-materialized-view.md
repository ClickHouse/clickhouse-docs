---
slug: /materialized-view/incremental-materialized-view
title: 'Incremental Materialized View'
description: 'How to use incremental materialized views to speed up queries'
keywords: ['incremental materialized views', 'speed up queries', 'query optimization']
score: 10000
---

import materializedViewDiagram from '@site/static/images/materialized-view/materialized-view-diagram.png';
import Image from '@theme/IdealImage';

## Background

Incremental Materialized Views (Materialized Views) allow users to shift the cost of computation from query time to insert time, resulting in faster `SELECT` queries.

Unlike in transactional databases like Postgres, a ClickHouse Materialized View is just a trigger that runs a query on blocks of data as they are inserted into a table. The result of this query is inserted into a second "target" table. Should more rows be inserted, results will again be sent to the target table where the intermediate results will be updated and merged. This merged result is the equivalent of running the query over all of the original data.

The principal motivation for Materialized Views is that the results inserted into the target table represent the results of an aggregation, filtering, or transformation on rows. These results will often be a smaller representation of the original data (a partial sketch in the case of aggregations). This, along with the resulting query for reading the results from the target table being simple, ensures query times are faster than if the same computation was performed on the original data, shifting computation (and thus query latency) from query time to insert time.

Materialized views in ClickHouse are updated in real time as data flows into the table they are based on, functioning more like continually updating indexes. This is in contrast to other databases where Materialized Views are typically static snapshots of a query that must be refreshed (similar to ClickHouse [Refreshable Materialized Views](/sql-reference/statements/create/view#refreshable-materialized-view)).

<Image img={materializedViewDiagram} size="md" alt="Materialized view diagram"/>

## Example {#example}

For example purposes we'll use the Stack Overflow dataset documented in ["Schema Design"](/data-modeling/schema-design).

Suppose we want to obtain the number of up and down votes per day for a post.

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

This is a reasonably simple query in ClickHouse thanks to the [`toStartOfDay`](/sql-reference/functions/date-time-functions#tostartofday) function:

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

This query is already fast thanks to ClickHouse, but can we do better?

If we want to compute this at insert time using a Materialized View, we need a table to receive the results. This table should only keep 1 row per day. If an update is received for an existing day, the other columns should be merged into the existing day's row. For this merge of incremental states to happen, partial states must be stored for the other columns.

This requires a special engine type in ClickHouse: the [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree). This replaces all the rows with the same ordering key with one row which contains summed values for the numeric columns. The following table will merge any rows with the same date, summing any numerical columns:

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

To demonstrate our Materialized View, assume our votes table is empty and have yet to receive any data. Our Materialized View performs the above `SELECT` on data inserted into `votes`, with the results sent to `up_down_votes_per_day`:

```sql
CREATE MATERIALIZED VIEW up_down_votes_per_day_mv TO up_down_votes_per_day AS
SELECT toStartOfDay(CreationDate)::Date AS Day,
       countIf(VoteTypeId = 2) AS UpVotes,
       countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY Day
```

The `TO` clause here is key, denoting where results will be sent to i.e. `up_down_votes_per_day`.

We can repopulate our votes table from our earlier insert:

```sql
INSERT INTO votes SELECT toUInt32(Id) AS Id, toInt32(PostId) AS PostId, VoteTypeId, CreationDate, UserId, BountyAmount
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/*.parquet')

0 rows in set. Elapsed: 111.964 sec. Processed 477.97 million rows, 3.89 GB (4.27 million rows/s., 34.71 MB/s.)
Peak memory usage: 283.49 MiB.
```

On completion, we can confirm the size of our `up_down_votes_per_day` - we should have 1 row per day:

```sql
SELECT count()
FROM up_down_votes_per_day
FINAL

┌─count()─┐
│    5723 │
└─────────┘
```

We've effectively reduced the number of rows here from 238 million (in `votes`) to 5000 by storing the result of our query. What's key here, however, is that if new votes are inserted into the `votes` table, new values will be sent to the `up_down_votes_per_day` for their respective day where they will be automatically merged asynchronously in the background - keeping only one row per day. `up_down_votes_per_day` will thus always be both small and up-to-date.

Since the merging of rows is asynchronous, there may be more than one vote per day when a user queries. To ensure any outstanding rows are merged at query time, we have two options:

- Use the `FINAL` modifier on the table name. We did this for the count query above.
- Aggregate by the ordering key used in our final table i.e. `CreationDate` and sum the metrics. Typically this is more efficient and flexible (the table can be used for other things), but the former can be simpler for some queries. We show both below:

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

This has sped up our query from 0.133s to 0.004s – an over 25x improvement!

:::important Important: `ORDER BY` = `GROUP BY`
In most cases the columns used in the `GROUP BY` clause of the Materialized Views transformation, should be consistent with those used in the `ORDER BY` clause of the target table if using the `SummingMergeTree` or `AggregatingMergeTree` table engines. These engines rely on the `ORDER BY` columns to merge rows with identical values during background merge operations. Misalignment between `GROUP BY` and `ORDER BY` columns can lead to inefficient query performance, suboptimal merges, or even data discrepancies.
:::

### A more complex example {#a-more-complex-example}

The above example uses Materialized Views to compute and maintain two sums per day. Sums represent the simplest form of aggregation to maintain partial states for - we can just add new values to existing values when they arrive. However, ClickHouse Materialized Views can be used for any aggregation type.

Suppose we wish to compute some statistics for posts for each day: the 99.9th percentile for the `Score` and an average of the `CommentCount`. The query to compute this might look like:

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

As before, we can create a Materialized View which executes the above query as new posts are inserted into our `posts` table.

For the purposes of example, and to avoid loading the posts data from S3, we will create a duplicate table `posts_null` with the same schema as `posts`. However, this table will not store any data and simply be used by the Materialized View when rows are inserted. To prevent storage of data, we can use the [`Null` table engine type](/engines/table-engines/special/null).

```sql
CREATE TABLE posts_null AS posts ENGINE = Null
```

The Null table engine is a powerful optimization - think of it as `/dev/null`. Our Materialized View will compute and store our summary statistics when our `posts_null` table receives rows at insert time - it's just a trigger. However, the raw data will not be stored. While in our case, we probably still want to store the original posts, this approach can be used to compute aggregates while avoiding storage overhead of the raw data.

The Materialized View thus becomes:

```sql
CREATE MATERIALIZED VIEW post_stats_mv TO post_stats_per_day AS
       SELECT toStartOfDay(CreationDate) AS Day,
       quantileState(0.999)(Score) AS Score_quantiles,
       avgState(CommentCount) AS AvgCommentCount
FROM posts_null
GROUP BY Day
```

Note how we append the suffix `State` to the end of our aggregate functions. This ensures the aggregate state of the function is returned instead of the final result. This will contain additional information to allow this partial state to merge with other states. For example, in the case of an average, this will include a count and sum of the column.

> Partial aggregation states are necessary to compute correct results. For example, for computing an average, simply averaging the averages of sub-ranges produces incorrect results.

We now create the target table for this view `post_stats_per_day` which stores these partial aggregate states:

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

While earlier the `SummingMergeTree` was sufficient to store counts, we require a more advanced engine type for other functions: the [`AggregatingMergeTree`](/engines/table-engines/mergetree-family/aggregatingmergetree).
To ensure ClickHouse knows that aggregate states will be stored, we define the `Score_quantiles` and `AvgCommentCount` as the type `AggregateFunction`, specifying the function source of the partial states and the type of their source columns. Like the `SummingMergeTree`, rows with the same `ORDER BY` key value will be merged (`Day` in the above example).

To populate our `post_stats_per_day` via our Materialized View, we can simply insert all rows from `posts` into `posts_null`:

```sql
INSERT INTO posts_null SELECT * FROM posts

0 rows in set. Elapsed: 13.329 sec. Processed 119.64 million rows, 76.99 GB (8.98 million rows/s., 5.78 GB/s.)
```

> In production, you would likely attach the Materialized View to the `posts` table. We have used `posts_null` here to demonstrate the null table.

Our final query needs to utilize the `Merge` suffix for our functions (as the columns store partial aggregation states):

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

Note we use a `GROUP BY` here instead of using `FINAL`.


## Materialized Views and JOINs

:::note Refreshable Materialized Views
The following applies to Incremental Materialized Views only. Refreshable Materialized Views execute their query peridocially over the full target dataset and fully support JOINs. Consider using for complex JOINs if a reduction in result freshness can be tolerated.
:::

Incremental Materialized views in ClickHouse fully support `JOIN` operations—but with one crucial constraint: **the Materialized View only triggers on inserts to the source table (the left-most table in the query).** Right-side tables in joins do not trigger updates, even if their data changes. This behavior is especially important when building **Incremental** Materialized Views, where data is aggregated or transformed during insert time.

When a Incremental Materialized View is defined using a `JOIN`, the left-most table in the `SELECT` query acts as the source. When new rows are inserted into this table, ClickHouse executes the Materialized View query *only* with those newly inserted rows. Right-side tables in the join are read in full during this execution, but changes to them alone do not trigger the view.

This behavior makes joins in Materialized Views similar to a snapshot join against static dimension data. 

This works well for enriching data with reference or dimension tables. However, any updates to the right-side tables (e.g., user metadata) will not retroactively update the Materialized View. To see updated data, new inserts must arrive in the source table.

### Example

Let's walk through a concrete example using the [Stack Overflow dataset](/data-modeling/schema-design). We'll use a Materialized View to compute **daily badges per user**, including the user's display name from the `users` table.

As a reminder, our table schemas:

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

We'll assume our users table is pre-populated:

```sql
INSERT INTO users
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/users.parquet');
```

The Materialized View and its associated target table:

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

:::note Grouping and Ordering Alignment
The `GROUP BY` clause in the Materialized View must include `DisplayName`, `UserId`, and `Day` to match the `ORDER BY` in the `SummingMergeTree` target table. This ensures rows are correctly aggregated and merged. Omitting any of these can lead to incorrect results or inefficient merges.
:::

If we now populate the badges, the view will be triggered - populating our `daily_badges_by_user` table.

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 433.762 sec. Processed 1.16 billion rows, 28.50 GB (2.67 million rows/s., 65.70 MB/s.)
```

Suppose we wish to view the badges achieved by a specific user:

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

Now, if this user receives a new badge and a row is inserted, our view will be updated:

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
Notice the latency of the insert here. The inserted user row is joined against the entire `users` table, significantly impacting insert performance. We propose approaches to address this below in ["Using Source Table in Filters and Joins"](/materialized-view/incremental-materialized-view#using-source-table-in-filters-and-joins-in-materialized-views).
:::


Conversely, if we insert a badge for a new user, followed by the row for the user, our Materialized View will fail to capture the users's metrics. 

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

The view, in this case, only executes for the badge insert before the user row exists. If we insert another badge for the user, a row is as expected inserted into our row:

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

Note, however, this result is incorrect.

### Best Practices for JOINs in Materialized Views {#join-best-practices}

- **Use the left-most table as the trigger.** Only the table on the left side of the `SELECT` statement triggers the Materialized View. Changes to right-side tables will not trigger updates.

- **Pre-insert joined data.** Ensure that data in joined tables exists before inserting rows into the source table. The join is evaluated at insert time, so missing data will result in unmatched rows or nulls.

- **Limit columns pulled from joins.** Select only the required columns from joined tables to minimize memory use and reduce insert-time latency (see below).

- **Evaluate insert-time performance.** JOINs increase the cost of inserts, especially with large right-side tables. Benchmark insert rates using representative production data.

- **Prefer dictionaries for simple lookups**. Use [Dictionaries](/dictionary) for key-value lookups (e.g., user ID to name) to avoid expensive JOIN operations.

- **Align `GROUP BY` and `ORDER BY` for merge efficiency.** When using `SummingMergeTree` or `AggregatingMergeTree`, ensure `GROUP BY` matches the `ORDER BY` clause in the target table to allow efficient row merging.

- **Use explicit column aliases.** When tables have overlapping column names, use aliases to prevent ambiguity and ensure correct results in the target table.

- **Consider insert volume and frequency.** JOINs work well in moderate insert workloads. For high-throughput ingestion, consider using staging tables, pre-joins, or other approaches such as Dictionaries and [Refreshable Materialized Views](/materialized-view/refreshable-materialized-view).

### Using Source Table in Filters and Joins {#using-source-table-in-filters-and-joins-in-materialized-views}

When working with Materialized Views in ClickHouse, it's important to understand how the source table is treated during the execution of the Materialized View's query. Specifically, the source table in the Materialized View's query is replaced with the inserted block of data. This behavior can lead to some unexpected results if not properly understood.

#### Example Scenario {#example-scenario}

Consider the following setup:

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

#### Explanation {#explanation}

In the above example, we have two Materialized Views `mvw1` and `mvw2` that perform similar operations but with a slight difference in how they reference the source table `t0`.

In `mvw1`, table `t0` is directly referenced inside a `(SELECT * FROM t0)` subquery on the right side of the JOIN. When data is inserted into `t0`, the Materialized View's query is executed with the inserted block of data replacing `t0`. This means that the join operation is performed only on the newly inserted rows, not the entire table.

In the second case with joining `vt0`, the view reads all the data from `t0`. This ensures that the join operation considers all rows in `t0`, not just the newly inserted block.

The key difference lies in how ClickHouse handles the source table in the Materialized View's query. When a Materialized View is triggered by an insert, the source table (`t0` in this case) is replaced by the inserted block of data. This behavior can be leveraged to optimize queries but also requires careful consideration to avoid unexpected results.

### Use Cases and Caveats {#use-cases-and-caveats}


In practice, you may use this behavior to optimize Materialized Views that only need to process a subset of the source table's data. For example, you can use a subquery to filter the source table before joining it with other tables. This can help reduce the amount of data processed by the Materialized View and improve performance.

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

In this example, set build from the `IN (SELECT id FROM t0)` subquery has only the newly inserted rows, which can help to filter `t1` against it.

#### Example with Stack Overflow

Consider our [earlier Materialized View example](/materialized-view/incremental-materialized-view#example) to compute **daily badges per user**, including the user's display name from the `users` table.


```sql
CREATE MATERIALIZED VIEW daily_badges_by_user_mv TO daily_badges_by_user AS
SELECT
    toDate(Date) AS Day,
    b.UserId,
    u.DisplayName,
    countIf(Class = 'Gold') AS Gold,
    countIf(Class = 'Silver') AS Silver,
    countIf(Class = 'Bronze') AS Bronze
FROM badges AS b
LEFT JOIN (SELECT Id, DisplayName FROM users WHERE Id IN (SELECT UserId FROM badges)) AS u ON b.UserId = u.Id
GROUP BY Day, b.UserId, u.DisplayName;
```

This view significantly impacted insert latency on the `badges` table e.g.

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 7.517 sec.
```

Using the approach above, we can optimize this view - adding a filter to the users table using the user ids in the inserted badge rows:


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

Note only does this speed up the initial badges insert:

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 132.118 sec. Processed 323.43 million rows, 4.69 GB (2.45 million rows/s., 35.49 MB/s.)
Peak memory usage: 1.99 GiB.
```

But also means future badge inserts are efficient:

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 0.583 sec.
```

In the above operation, only one row is retrieved from the users table for the user id `2936484`. This lookup is also optimized with a table ordering key of `Id`.

## Other applications {#other-applications}

The above focuses primarily on using Materialized Views to incrementally update partial aggregates of data, thus moving the computation from query to insert time. Beyond this common use case, Materialized Views have a number of other applications.

### Filtering and transformation {#filtering-and-transformation}

In some situations, we may wish to only insert a subset of the rows and columns on insertion. In this case, our `posts_null` table could receive inserts, with a `SELECT` query filtering rows prior to insertion into the `posts` table. For example, suppose we wished to transform a `Tags` column in our `posts` table. This contains a pipe delimited list of tag names. By converting these into an array, we can more easily aggregate by individual tag values.

> We could perform this transformation when running an `INSERT INTO SELECT`. The Materialized View allows us to encapsulate this logic in ClickHouse DDL and keep our `INSERT` simple, with the transformation applied to any new rows.

Our Materialized View for this transformation is shown below:

```sql
CREATE MATERIALIZED VIEW posts_mv TO posts AS
        SELECT * EXCEPT Tags, arrayFilter(t -> (t != ''), splitByChar('|', Tags)) as Tags FROM posts_null
```

### Lookup table {#lookup-table}

Users should consider their access patterns when choosing the ClickHouse ordering key with the columns which are frequently used in filter and aggregation clauses being used. This can be restrictive for scenarios where users have more diverse access patterns which cannot be encapsulated in a single set of columns. For example, consider the following `comments` table:

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

The ordering key here optimizes the table for queries which filter by `PostId`.

Suppose a user wishes to filter on a specific `UserId` and compute their average `Score`:

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

While fast (the data is small for ClickHouse), we can tell this requires a full table scan from the number of rows processed - 90.38 million. For larger datasets, we can use a Materialized View to lookup our ordering key values `PostId` for filtering column `UserId`. These values can then be used to perform an efficient lookup.

In this example, our Materialized View can be very simple, selecting only the `PostId` and `UserId` from `comments` on insert. These results are in turn sent to a table `comments_posts_users` which is ordered by `UserId`. We create a null version of the `Comments` table below and use this to populate our view and `comments_posts_users` table:

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

We can now use this view in a subquery to accelerate our previous query:

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

### Chaining {#chaining}

Materialized views can be chained, allowing complex workflows to be established. For a practical example, we recommend this [blog post](https://clickhouse.com/blog/chaining-materialized-views).
