---
sidebar_label: 'JOINs and Denormalization'
description: 'How to optimize JOINs and leverage denormalization to speed up JOINs.'
slug: /integrations/clickpipes/postgres/joins_and_denormalization
title: 'JOINs and Denormalization'
---

import clickpipes_joins_mv from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-cdc-joins-mv.png';
import Image from '@theme/IdealImage';

Since Postgres is a relational database, its data model is heavily [normalized](https://en.wikipedia.org/wiki/Database_normalization), often involving hundreds of tables. In ClickHouse, denormalization can be beneficial at times to optimize JOIN performance. This page covers common JOINs tips and best practices to denormalize data.

## Optimizing JOINs {#optimizing-joins}

For most use cases, running queries with JOINs (as in Postgres) on raw data in ClickHouse should perform significantly better than in Postgres.

You can run the JOIN queries without any changes and observe how ClickHouse performs.

If case you want to optimize further, here are a few techniques you can try:

- **Use subqueries or CTE for filtering**: Modify JOINs as subqueries where you filter tables within the subquery before passing them to the planner. This is usually unnecessary, but it's sometimes worth trying. Below is an example of a JOIN query using a sub-query.

```sql
-- Use a subquery to reduce the number of rows to join
SELECT
    t.id AS UserId,
    t.displayname,
    t.views,
    COUNTDistinct(multiIf(c.id != 0, c.id, NULL)) AS CommentsCount
FROM (
    SELECT id, displayname, views
    FROM users
    ORDER BY views DESC
    LIMIT 10
) t
LEFT JOIN comments c ON t.id = c.userid
GROUP BY t.id, t.displayname, t.views
ORDER BY t.views DESC
SETTINGS final=1;
```

-  **Optimize Ordering Keys**: Consider including JOIN columns in the `Ordering Key` of the table. For more details, refer to the page on [Ordering Keys](/integrations/clickpipes/postgres/ordering_keys).

- **Use Dictionaries for dimension tables**: Consider creating a [dictionary](/sql-reference/dictionaries) from a table in ClickHouse to improve lookup performance during query execution. This [documentation](/dictionary#speeding-up-joins-using-a-dictionary) provides an example of how to use dictionaries to optimize JOIN queries with a StackOverflow dataset.

- **JOIN algorithms**: ClickHouse offers various [algorithms](/guides/joining-tables) for joining tables, and selecting the right one depends on the specific use case. Below are two examples of JOIN queries using different algorithms tailored to distinct scenarios: in the first case, the goal is to reduce memory usage, so the partial_merge algorithm is used, while in the second case, the focus is on performance, and the parallel_hash algorithm is used. Note the difference in memory used.

```sql
-- Use partial merge algorithm
SELECT
    sum(p.viewcount) AS viewcount,
    p.owneruserid AS user_id,
    u.displayname AS display_name
FROM posts AS p
FINAL
LEFT JOIN users AS u
FINAL ON (u.id = p.owneruserid) AND (u._peerdb_is_deleted = 0)
WHERE (p.owneruserid > 0) AND (p._peerdb_is_deleted = 0)
GROUP BY
    user_id,
    display_name
ORDER BY viewcount DESC
LIMIT 10
FORMAT `NULL`
SETTINGS join_algorithm = 'partial_merge'

10 rows in set. Elapsed: 7.202 sec. Processed 60.42 million rows, 1.83 GB (8.39 million rows/s., 254.19 MB/s.)
Peak memory usage: 1.99 GiB.

-- Use parallel hash algorithm
SELECT
    sum(p.viewcount) AS viewcount,
    p.owneruserid AS user_id,
    u.displayname AS display_name
FROM posts AS p
FINAL
LEFT JOIN users AS u
FINAL ON (u.id = p.owneruserid) AND (u._peerdb_is_deleted = 0)
WHERE (p.owneruserid > 0) AND (p._peerdb_is_deleted = 0)
GROUP BY
    user_id,
    display_name
ORDER BY viewcount DESC
LIMIT 10
FORMAT `NULL`
SETTINGS join_algorithm = 'parallel_hash'

10 rows in set. Elapsed: 2.160 sec. Processed 60.42 million rows, 1.83 GB (27.97 million rows/s., 847.53 MB/s.)
Peak memory usage: 5.44 GiB.
```

## Denormalization {#denormalization}

Another approach users follow to speed up queries is denormalizing data in ClickHouse to create a more flattened table. You could do this with [Refreshable Materialized views](/materialized-view/refreshable-materialized-view) or [Incremental Materialized views](/materialized-view/incremental-materialized-view).

Two main strategies will be explored when [denormalizing data using materialized views](/data-modeling/denormalization). One is to flatten the raw data with no transformation simply; we'll refer to it as _raw denormalization_. The other approach is to aggregate the data as we denormalize it and store it in a Materialized view; we'll refer to it as _aggregated denormalization_. 

### Raw denormalization with Refreshable Materialized Views {#raw-denormalization-with-refreshable-materialized-views}

Using Refreshable Materialized views to flatten data is easy and allows for the filtering out of duplicates at refresh time, as described in the [deduplication strategy page](/integrations/clickpipes/postgres/deduplication).

Let's take an example of how we can achieve that by flattening the table posts and users.

```sql
-- Create the RMV
CREATE MATERIALIZED VIEW raw_denormalization_rmv
REFRESH EVERY 1 MINUTE ENGINE = MergeTree()
ORDER BY (id)
AS
SELECT p.*, u.* FROM posts p FINAL LEFT JOIN users u FINAL ON u.id = p.owneruserid AND u._peerdb_is_deleted = 0
WHERE p._peerdb_is_deleted = 0;
```

After a few seconds the materialized view is populated with the result of the JOIN query. We can query it with without JOINs or the FINAL keyword. 

```sql
-- Number of posts and sum view for top 10 most upvoted users 
SELECT
    countDistinct(id) AS nb_posts,
    sum(viewcount) AS viewcount,
    u.id as user_id,
    displayname,
    upvotes
FROM raw_denormalization_rmv
GROUP BY
    user_id,
    displayname,
    upvotes
ORDER BY upvotes DESC
LIMIT 10
```

### Aggregated denormalization with Refreshable Materialized Views {#aggregated-denormalization-with-refreshable-materialized-views}

It is also a common strategy to aggregate the data and store the result in separate tables using Refreshable Materialized Views for even faster access to results but at the cost of query flexibility.

Consider a query that joins the table posts, users, comments, and votes to retrieve the number of posts, votes, and comments for the most upvoted users. We will use a Refreshable Materialized View to keep the result of this query.

```sql
-- Create the Refreshable materialized view
CREATE MATERIALIZED VIEW top_upvoted_users_activity_mv REFRESH EVERY 10 minute ENGINE = MergeTree()
ORDER BY (upvotes) 
AS 
SELECT
    u.id AS UserId,
    u.displayname,
    u.upvotes,
    COUNT(DISTINCT CASE WHEN p.id <> 0 THEN p.id END) AS PostCount,
    COUNT(DISTINCT CASE WHEN c.id <> 0 THEN c.id END) AS CommentsCount,
    COUNT(DISTINCT CASE WHEN v.id <> 0 THEN v.id END) AS VotesCount
FROM users AS u
LEFT JOIN posts AS p ON u.id = p.owneruserid AND p._peerdb_is_deleted=0
LEFT JOIN comments AS c ON u.id = c.userid AND c._peerdb_is_deleted=0
LEFT JOIN votes AS v ON u.id = v.userid AND v._peerdb_is_deleted=0
WHERE u._peerdb_is_deleted=0
GROUP BY
    u.id,
    u.displayname,
    u.upvotes
ORDER BY u.upvotes DESC
SETTINGS final=1;
```

The query might take a few minutes to run. In this case, there is no need to use a Common Table Expression, as we want to process the entire dataset. 

To return the same result as the JOIN query, we run a simple query on the materialized view. 

```sql
SELECT *
FROM top_upvoted_users_activity_mv
ORDER BY upvotes DESC
LIMIT 10;
```

#### Raw denormalization using Incremental Materialized View {#raw-denormalization-using-incremental-materialized-view}

Incremental Materialized Views can also be used for raw denormalization, offering two key advantages over Refreshable Materialized Views (RMVs):

-   The query runs only on newly inserted rows rather than scanning the entire source table, making it a suitable choice for massive datasets, including those in the petabyte range.
-   The materialized view is updated in real-time as new rows are inserted into the source table, whereas RMVs refresh periodically.

However, a limitation is that deduplication cannot occur at insert time. Queries on the destination table still require the FINAL keyword to handle duplicates.

```sql
-- Create Materialized view 
CREATE MATERIALIZED VIEW raw_denormalization_imv
ENGINE = ReplacingMergeTree(_peerdb_version)
ORDER BY (id)  POPULATE AS
SELECT p.id as id, p.*, u.* FROM posts p LEFT JOIN users u ON p.owneruserid = u.id;
```

When querying the view, we must include the FINAL modifier to deduplicate the data. 

```sql
SELECT count()
FROM raw_denormalization_imv
FINAL
WHERE _peerdb_is_deleted = 0
```

#### Aggregated denormalization using Incremental Materialized View  {#aggregated-denormalization-using-incremental-materialized-view}

Incremental Materialized View can also aggregate data as it gets synchronized from PostgreSQL. However, this is a bit more complex as we must account for duplicates and deleted rows when aggregating them. ClickHouse supports a specific table engine, [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree), that is specifically designed to handle this advanced use case.

Let's walk through an example to understand better how to implement this. Consider a query that calculates the number of new questions on StackOverflow per day.

```sql
-- Number of Questions and Answers per day
SELECT
    CAST(toStartOfDay(creationdate), 'Date') AS Day,
    countIf(posttypeid = 1) AS Questions,
    countIf(posttypeid = 2) AS Answers
FROM posts
GROUP BY Day
ORDER BY Day DESC
LIMIT 5
```

One challenge is that each update in PostgreSQL creates a new row in ClickHouse. Simply aggregating the incoming data and storing the result in the destination table would lead to duplicate counts.

Let’s look at what’s happening in ClickHouse when using a Materialized view with Postgres CDC. 

<Image img={clickpipes_joins_mv} alt="Clickpipes Postgres JOINs MV" size="lg" border/>

When the row with `id=6440` is updated in PostgreSQL, a new version is inserted into ClickHouse as a separate row. Since the Materialized View processes only the newly inserted block of rows and does not have access to the entire table at ingest time, this leads to a duplicated count.

The AggregatingMergeTree mitigates this issue by allowing the retention of only one row per primary key (or order by key) alongside the aggregated and state of the values.
Let's create a table `daily_posts_activity` to store the data. The table uses AggregatingMergeTree for the table engine and uses [AggregateFunction](/sql-reference/data-types/aggregatefunction) field type for the columns `Questions` and `Answers`.

```sql
CREATE TABLE daily_posts_activity
(
    Day Date NOT NULL,
    Questions AggregateFunction(uniq, Nullable(Int32)),
    Answers AggregateFunction(uniq, Nullable(Int32))
)
ENGINE = AggregatingMergeTree()
ORDER BY Day;
```

Next, we ingest data from the posts table. We use the [uniqState](/sql-reference/data-types/aggregatefunction#data-insertion) function to track the field's unique states, enabling us to eliminate duplicates.

```sql
INSERT INTO daily_posts_activity
SELECT toStartOfDay(creationdate)::Date AS Day,
       uniqState(CASE WHEN posttypeid=1 THEN id END) as Questions,
       uniqState(CASE WHEN posttypeid=2 THEN id END) as Answers
FROM posts FINAL
GROUP BY Day
```

Then, we can create the Materialized view to keep running the query on each new incoming block of rows. 

```sql
CREATE MATERIALIZED VIEW daily_posts_activity_mv TO daily_posts_activity AS
SELECT toStartOfDay(creationdate)::Date AS Day,
       uniqState(CASE WHEN posttypeid=1 THEN id END) as Questions,
       uniqState(CASE WHEN posttypeid=2 THEN id END) as Answers
FROM posts
GROUP BY Day
```

To query the `daily_posts_activity`, we have to use the function [uniqMerge](/sql-reference/data-types/aggregatefunction#data-selection) to combine the states and return the correct count.

```sql
SELECT
    Day,
    uniqMerge(Questions) AS Questions,
    uniqMerge(Answers) AS Answers
FROM daily_posts_activity
GROUP BY Day
ORDER BY Day DESC
LIMIT 5
```

This works great for our use case. 

The deleted rows in PostgreSQL will not be reflected in the `daily_posts_activity` aggregated table, which means that this table reports the total number of posts ever created per day but not the latest state.
