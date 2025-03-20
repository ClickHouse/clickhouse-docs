---
slug: /en/updating-data/overview
title: Overview
description: How to update data in ClickHouse
keywords: [update, updating data]
---

## Differences between updating data in ClickHouse and OLTP databases

When it comes to handling updates, ClickHouse and OLTP databases diverge significantly due to their underlying design philosophies and target use cases. For example, PostgreSQL, a row-oriented, ACID-compliant relational database, supports robust and transactional update and delete operations, ensuring data consistency and integrity through mechanisms like Multi-Version Concurrency Control (MVCC). This allows for safe and reliable modifications even in high-concurrency environments.

Conversely, ClickHouse is a column-oriented database optimized for read-heavy analytics and high throughput append-only operations. While it does natively support in-place updates and delete, they must be used carefully to avoid high I/O. Alternatively, tables can be restructured to convert delete and update into appended operations where they are processed asynchronously and/or at read time, thus reflecting the focus on high-throughput data ingestion and efficient query performance over real-time data manipulation.

## Methods to update data in ClickHouse

There are several ways to update data in ClickHouse, each with its own advantages and performance characteristics. You should select the appropriate method based on your data model and the amount of data you intend to update.

For both operations, if the number of submitted mutations constantly exceeds the number of mutations that are processed in the background over some time interval, the queue of non-materialized mutations that have to be applied will continue to grow. This will result in the eventual degradation of `SELECT` query performance.

In summary, update operations should be issued carefully, and the mutations queue should be tracked closely using the `system.mutations` table. Do not issue updates frequently as you would in OLTP databases. If you have a requirement for frequent updates, see [ReplacingMergeTree](/en/engines/table-engines/mergetree-family/replacingmergetree).

| Method                                                                                | Syntax                               | When to use                                                                                                                                                                                                                              |
|---------------------------------------------------------------------------------------|--------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Update mutation](/en/sql-reference/statements/alter/update)                          | `ALTER TABLE [table] UPDATE`         | Use when data must be updated to disk immediately (e.g. for compliance). Negatively affects `SELECT` performance.                                                                                                                        |
| [Lightweight update](/en/guides/developer/lightweight-update)                         | `ALTER TABLE [table] UPDATE`         | Enable using `SET apply_mutations_on_fly = 1;`. Use when updating small amounts of data. Rows are immediately returned with updated data in all subsequent `SELECT` queries but are initially only internally marked as updated on disk. |
| [ReplacingMergeTree](/en/engines/table-engines/mergetree-family/replacingmergetree)   | `ENGINE = ReplacingMergeTree`        | Use when updating large amounts of data. This table engine is optimized for data deduplication on merges.                                                                                                                                |
| [CollapsingMergeTree](/en/engines/table-engines/mergetree-family/collapsingmergetree) | `ENGINE = CollapsingMergeTree(Sign)` | Use when updating individual rows frequently, or for scenarios where you need to maintain the latest state of objects that change over time. For example, tracking user activity or article stats.                                       |

Here is a summary of the different ways to update data in ClickHouse:

## Update Mutations

Update mutations can be issued through a `ALTER TABLE … UPDATE` command e.g.

```sql
ALTER TABLE posts_temp
	(UPDATE AnswerCount = AnswerCount + 1 WHERE AnswerCount = 0)
```
These are extremely IO-heavy, rewriting all the parts that match the `WHERE` expression. There is no atomicity to this process - parts are substituted for mutated parts as soon as they are ready, and a `SELECT` query that starts executing during a mutation will see data from parts that have already been mutated along with data from parts that have not been mutated yet. Users can track the state of the progress via the [systems.mutations](/en/operations/system-tables/mutations#system_tables-mutations) table. These are I/O intense operations and should be used sparingly as they can impact cluster `SELECT` performance.

Read more about [update mutations](/en/sql-reference/statements/alter/update).

## Lightweight Updates

Lightweight updates provide a mechanism to update rows such that they are updated immediately, and subsequent `SELECT` queries will automatically return with the changed values (this incurs an overhead and will slow queries). This effectively addresses the atomicity limitation of normal mutations. We show an example below:

```sql
SET apply_mutations_on_fly = 1;

SELECT ViewCount
FROM posts
WHERE Id = 404346

┌─ViewCount─┐
│ 	26762   │
└───────────┘

1 row in set. Elapsed: 0.115 sec. Processed 59.55 million rows, 238.25 MB (517.83 million rows/s., 2.07 GB/s.)
Peak memory usage: 113.65 MiB.

-increment count
ALTER TABLE posts
	(UPDATE ViewCount = ViewCount + 1 WHERE Id = 404346)

SELECT ViewCount
FROM posts
WHERE Id = 404346

┌─ViewCount─┐
│ 	26763   │
└───────────┘

1 row in set. Elapsed: 0.149 sec. Processed 59.55 million rows, 259.91 MB (399.99 million rows/s., 1.75 GB/s.)
```

Note that for lightweight updates, a mutation is still used to update the data; it is just not materialized immediately and applied during `SELECT` queries. It will still be applied in the background as an asynchronous process and incurs the same heavy overhead as a mutation and thus is an I/O intense operation that should be used sparingly. The expressions that can be used with this operation are also limited (see here for [details](/en/guides/developer/lightweight-update#support-for-subqueries-and-non-deterministic-functions)).

Read more about [lightweight updates](/en/guides/developer/lightweight-update).

## Collapsing Merge Tree

Stemming from the idea that updates are expensive but inserts can be leveraged to perform updates,
the [`CollapsingMergeTree`](/en/engines/table-engines/mergetree-family/collapsingmergetree) table engine
can be used together with a `sign` column as a way to tell ClickHouse to update a specific row by collapsing (deleting)
a pair of rows with sign `1` and `-1`.
If `-1` is inserted for the `sign` column, the whole row will be deleted.
If `1` is inserted for the `sign` column, ClickHouse will keep the row.
Rows to update are identified based on the sorting key used in the `ORDER BY ()` statement when creating the table.

```sql
CREATE TABLE UAct
(
    UserID UInt64,
    PageViews UInt8,
    Duration UInt8,
    Sign Int8 -- A special column used with the CollapsingMergeTree table engine
)
ENGINE = CollapsingMergeTree(Sign)
ORDER BY UserID

INSERT INTO UAct VALUES (4324182021466249494, 5, 146, 1)
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, -1) -- sign = -1 signals to update the state of this row
INSERT INTO UAct VALUES (4324182021466249494, 6, 185, 1) -- the row is replaced with the new state

SELECT
    UserID,
    sum(PageViews * Sign) AS PageViews,
    sum(Duration * Sign) AS Duration
FROM UAct
GROUP BY UserID
HAVING sum(Sign) > 0

┌──────────────UserID─┬─PageViews─┬─Duration─┐
│ 4324182021466249494 │         6 │      185 │
└─────────────────────┴───────────┴──────────┘
```

:::note
The approach above for updating requires users to maintain state client side.
While this is most efficient from ClickHouse's perspective, it can be complex to work with at scale.

We recommend reading the documentation
for [`CollapsingMergeTree`](/en/engines/table-engines/mergetree-family/collapsingmergetree)
for a more comprehensive overview.
:::

## More Resources

- [Handling Updates and Deletes in ClickHouse](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
