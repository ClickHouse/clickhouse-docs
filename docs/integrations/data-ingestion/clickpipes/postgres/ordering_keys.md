---
sidebar_label: 'Ordering keys'
description: 'How to define custom ordering keys.'
slug: /integrations/clickpipes/postgres/ordering_keys
title: 'Ordering keys'
---

[Ordering Keys](/migrations/postgresql/designing-schemas#primary-ordering-keys-in-clickhouse) (a.k.a. sorting keys) define how data is sorted on disk and indexed for a table in ClickHouse. When replicating from Postgres, ClickPipes sets the Postgres primary key of a table as the ordering key for the corresponding table in ClickHouse. In most cases, the Postgres primary key serves as a sufficient ordering key, as ClickHouse is already optimized for fast scans, and custom ordering keys are often not required.

For larger use cases, you should include additional columns beyond the Postgres primary key in the ClickHouse ordering key to optimize queries. By default, choosing an ordering key different from the Postgres primary key can cause data deduplication issues in ClickHouse. This happens because the ordering key in ClickHouse serves a dual role: it controls data indexing and sorting while acting as the deduplication key. The easiest way to address this issue is by defining refreshable materialized views.

## Use Refreshable Materialized Views {#use-refreshable-materialized-views}

A simple way to define custom ordering keys (ORDER BY) is using [refreshable materialized views](/materialized-view/refreshable-materialized-view) (MVs). These allow you to periodically (e.g., every 5 or 10 minutes) copy the entire table with the desired ordering key. 

Below is an example of a Refreshable MV with a custom ORDER BY and required deduplication:

```sql
CREATE MATERIALIZED VIEW posts_final
REFRESH EVERY 10 second ENGINE = ReplacingMergeTree(_peerdb_version)
ORDER BY (owneruserid,id) -- different ordering key but with suffixed postgres pkey
AS
SELECT * FROM posts FINAL 
WHERE _peerdb_is_deleted = 0; -- this does the deduplication
```

## Custom ordering keys without refreshable materialized views {#custom-ordering-keys-without-refreshable-materialized-views}

If refreshable materialized views don't work due to the scale of data, here are a few recommendations you can follow to define custom ordering keys on larger tables and overcome deduplication-related issues.

### Choose ordering key columns that don't change for a given row

When including additional columns in the ordering key for ClickHouse (besides the primary key from Postgres), we recommend selecting columns that don't change for each row. This helps prevent data consistency and deduplication issues with ReplacingMergeTree.

For example, in a multi-tenant SaaS application, using (`tenant_id`, `id`) as the ordering key is a good choice. These columns uniquely identify each row, and `tenant_id` remains constant for an `id` even if other columns change. Since deduplication by id aligns with deduplication by (tenant_id, id), it helps avoid data [deduplication issues](https://docs.peerdb.io/mirror/ordering-key-different) that could arise if tenant_id were to change.

**Note**: If you have scenarios where ordering keys need to include columns that change, please reach out to us at support@clickhouse.com. There are advanced methods to handle this, and we will work with you to find a solution.

### Set Replica Identity on Postgres tables to custom ordering key

For Postgres CDC to function as expected, it is important to modify the `REPLICA IDENTITY` on tables to include the ordering key columns. This is essential for handling DELETEs accurately.

If the `REPLICA IDENTITY` does not include the ordering key columns, Postgres CDC will not capture the values of columns other than the primary key - this is a limitation of Postgres logical decoding. All ordering key columns besides the primary key in Postgres will have nulls. This affects deduplication, meaning the previous version of the row may not be deduplicated with the latest deleted version (where `_peerdb_is_deleted` is set to 1).

In the above example with `owneruserid` and `id`, if the primary key does not already include `owneruserid`, you need to have a `UNIQUE INDEX` on (`owneruserid`, `id`) and set it as the `REPLICA IDENTITY` for the table. This ensures that Postgres CDC captures the necessary column values for accurate replication and deduplication.

Below is an example of how to do this on the events table. Make sure to apply this to all tables with modified ordering keys.

```sql
-- Create a UNIQUE INDEX on (owneruserid, id)
CREATE UNIQUE INDEX posts_unique_owneruserid_idx ON posts(owneruserid, id);
-- Set REPLICA IDENTITY to use this index
ALTER TABLE posts REPLICA IDENTITY USING INDEX posts_unique_owneruserid_idx;
```

## Projections {#projections}

[Projections](/sql-reference/statements/alter/projection) are useful for running queries on a column that is not a part of the primary key.

> The biggest caveat with Projections is that they get skipped when querying the table with the FINAL keyword and do not account for deduplication. This could work for a few use cases where duplicates (updates, deletes) are not present or are less common.

Projections are defined on the table we want to add a custom ordering key for. Then, each time a query is executed on this table, ClickHouse determines if the query execution can benefit from using one of the existing Projections.

Let's take an example where we want to order the table posts by the field `creationdate` instead of the current one, `id`. This would benefit queries that filter using a date range.

Consider the following query that finds the most viewed posts mentioning "clickhouse" in 2024.

```sql
SELECT
    id,
    title,
    viewcount
FROM stackoverflow.posts
WHERE (toYear(creationdate) = 2024) AND (body LIKE '%clickhouse%')
ORDER BY viewcount DESC
LIMIT 5

5 rows in set. Elapsed: 0.617 sec. Processed 4.69 million rows, 714.67 MB (7.60 million rows/s., 1.16 GB/s.)
Peak memory usage: 147.04 MiB.
```

By default, ClickHouse needs to do a full scan of the table as `id` is in the ORDER BY. We can note in the last query that 4.69 million rows got processed.
Now, let's add a Projection to order by `creationdate`.

```sql
-- Create the Projection
ALTER TABLE posts ADD PROJECTION creation_date_projection (
SELECT
*
ORDER BY creationdate
);

-- Materialize the Projection
ALTER TABLE posts MATERIALIZE PROJECTION creation_date_projection;
```

Then, we run again the same query. 

```sql
SELECT
    id,
    title,
    viewcount
FROM stackoverflow.posts
WHERE (toYear(creationdate) = 2024) AND (body LIKE '%clickhouse%')
ORDER BY viewcount DESC
LIMIT 5

5 rows in set. Elapsed: 0.438 sec. Processed 386.80 thousand rows, 680.42 MB (882.29 thousand rows/s., 1.55 GB/s.)
Peak memory usage: 79.37 MiB.
```

ClickHouse utilized the Projection to execute the query, reducing rows scanned to just 386,000 compared to 4.69 million previously, while also lowering memory usage.
