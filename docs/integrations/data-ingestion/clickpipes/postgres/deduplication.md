---
sidebar_label: 'Deduplication strategies'
description: 'Handle duplicates and deleted rows.'
slug: /integrations/clickpipes/postgres/deduplication
title: 'Deduplication strategies (using CDC)'
keywords: ['deduplication', 'postgres', 'clickpipes', 'replacingmergetree', 'final']
doc_type: 'guide'
---

import clickpipes_initial_load from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-cdc-initial-load.png';
import Image from '@theme/IdealImage';

Updates and deletes replicated from Postgres to ClickHouse result in duplicated rows in ClickHouse due to its data storage structure and the replication process. This page covers why this happens and the strategies to use in ClickHouse to handle duplicates.

## How does data get replicated? {#how-does-data-get-replicated}

### PostgreSQL logical decoding {#PostgreSQL-logical-decoding}

ClickPipes uses [Postgres Logical Decoding](https://www.pgedge.com/blog/logical-replication-evolution-in-chronological-order-clustering-solution-built-around-logical-replication) to consume changes as they happen in Postgres. The Logical Decoding process in Postgres enables clients like ClickPipes to receive changes in a human-readable format, i.e., a series of INSERTs, UPDATEs, and DELETEs.

### ReplacingMergeTree {#replacingmergetree}

ClickPipes maps Postgres tables to ClickHouse using the [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) engine. ClickHouse performs best with append-only workloads and does not recommend frequent UPDATEs. This is where ReplacingMergeTree is particularly powerful.

With ReplacingMergeTree, updates are modeled as inserts with a newer version (`_peerdb_version`) of the row, while deletes are inserts with a newer version and `_peerdb_is_deleted` marked as true. The ReplacingMergeTree engine deduplicates/merges data in the background, and retains the latest version of the row for a given primary key (id), enabling efficient handling of UPDATEs and DELETEs as versioned inserts.

Below is an example of a CREATE Table statement executed by ClickPipes to create the table in ClickHouse.

```sql
CREATE TABLE users
(
    `id` Int32,
    `reputation` String,
    `creationdate` DateTime64(6),
    `displayname` String,
    `lastaccessdate` DateTime64(6),
    `aboutme` String,
    `views` Int32,
    `upvotes` Int32,
    `downvotes` Int32,
    `websiteurl` String,
    `location` String,
    `accountid` Int32,
    `_peerdb_synced_at` DateTime64(9) DEFAULT now64(),
    `_peerdb_is_deleted` Int8,
    `_peerdb_version` Int64
)
ENGINE = ReplacingMergeTree(_peerdb_version)
PRIMARY KEY id
ORDER BY id;
```

### Illustrative example {#illustrative-example}

The illustration below walks through a basic example of synchronization of a table `users` between PostgreSQL and ClickHouse using ClickPipes.

<Image img={clickpipes_initial_load} alt="ClickPipes initial load" size="lg"/>

**Step 1** shows the initial snapshot of the 2 rows in PostgreSQL and ClickPipes performing the initial load of those 2 rows to ClickHouse. As you can observe, both rows are copied as-is to ClickHouse.

**Step 2** shows three operations on the users table: inserting a new row, updating an existing row, and deleting another row.

**Step 3** shows how ClickPipes replicates the INSERT, UPDATE, and DELETE operations to ClickHouse as versioned inserts. The UPDATE appears as a new version of the row with ID 2, while the DELETE appears as a new version of ID 1 which is marked as true using `_is_deleted`. Because of this, ClickHouse has three additional rows compared to PostgreSQL.

As a result, running a simple query like `SELECT count(*) FROM users;` may produce different results in ClickHouse and PostgreSQL. According to the [ClickHouse merge documentation](/merges#replacing-merges), outdated row versions are eventually discarded during the merge process. However, the timing of this merge is unpredictable, meaning queries in ClickHouse may return inconsistent results until it occurs.

How can we ensure identical query results in both ClickHouse and PostgreSQL?

###  Deduplicate using FINAL Keyword {#deduplicate-using-final-keyword}

The recommended way to deduplicate data in ClickHouse queries is to use the [FINAL modifier.](/sql-reference/statements/select/from#final-modifier) This ensures only the deduplicated rows are returned.

Let's look at how to apply it to three different queries.

_Take note of the WHERE clause in the following queries, used to filter out deleted rows._

- **Simple count query**: Count the number of posts.

This is the simplest query you can run to check if the synchronization went fine. The two queries should return the same count.

```sql
-- PostgreSQL
SELECT count(*) FROM posts;

-- ClickHouse 
SELECT count(*) FROM posts FINAL WHERE _peerdb_is_deleted=0;
```

-  **Simple aggregation with JOIN**: Top 10 users who have accumulated the most views.

An example of an aggregation on a single table. Having duplicates here would greatly affect the result of the sum function.

```sql
-- PostgreSQL 
SELECT
    sum(p.viewcount) AS viewcount,
    p.owneruserid AS user_id,
    u.displayname AS display_name
FROM posts p
LEFT JOIN users u ON u.id = p.owneruserid
-- highlight-next-line
WHERE p.owneruserid > 0
GROUP BY user_id, display_name
ORDER BY viewcount DESC
LIMIT 10;

-- ClickHouse 
SELECT
    sum(p.viewcount) AS viewcount,
    p.owneruserid AS user_id,
    u.displayname AS display_name
FROM posts AS p
FINAL
LEFT JOIN users AS u
FINAL ON (u.id = p.owneruserid) AND (u._peerdb_is_deleted = 0)
-- highlight-next-line
WHERE (p.owneruserid > 0) AND (p._peerdb_is_deleted = 0)
GROUP BY
    user_id,
    display_name
ORDER BY viewcount DESC
LIMIT 10
```

#### FINAL setting {#final-setting}

Rather than adding the FINAL modifier to each table name in the query, you can use the [FINAL setting](/operations/settings/settings#final) to apply it automatically to all tables in the query.

This setting can be applied either per query or for an entire session.

```sql
-- Per query FINAL setting
SELECT count(*) FROM posts SETTINGS FINAL = 1;

-- Set FINAL for the session
SET final = 1;
SELECT count(*) FROM posts; 
```

#### ROW policy {#row-policy}

An easy way to hide the redundant `_peerdb_is_deleted = 0` filter is to use [ROW policy.](/docs/operations/access-rights#row-policy-management) Below is an example that creates a row policy to exclude the deleted rows from all queries on the table votes.

```sql
-- Apply row policy to all users
CREATE ROW POLICY cdc_policy ON votes FOR SELECT USING _peerdb_is_deleted = 0 TO ALL;
```

> Row policies are applied to a list of users and roles. In this example, it is applied to all users and roles. This can be adjusted to only specific users or roles.

### Query like with Postgres {#query-like-with-postgres}

Migrating an analytical dataset from PostgreSQL to ClickHouse often requires modifying application queries to account for differences in data handling and query execution. 

This section will explore techniques for deduplicating data while keeping the original queries unchanged.

#### Views {#views}

[Views](/sql-reference/statements/create/view#normal-view) are a great way to hide the FINAL keyword from the query, as they do not store any data and simply perform a read from another table on each access.

Below is an example of creating views for each table of our database in ClickHouse with the FINAL keyword and filter for the deleted rows.

```sql
CREATE VIEW posts_view AS SELECT * FROM posts FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW users_view AS SELECT * FROM users FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW votes_view AS SELECT * FROM votes FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW comments_view AS SELECT * FROM comments FINAL WHERE _peerdb_is_deleted=0;
```

Then, we can query the views using the same query we would use in PostgreSQL. 

```sql
-- Most viewed posts
SELECT
    sum(viewcount) AS viewcount,
    owneruserid
FROM posts_view
WHERE owneruserid > 0
GROUP BY owneruserid
ORDER BY viewcount DESC
LIMIT 10
```

#### Refreshable materialized view {#refreshable-material-view}

Another approach is to use a [refreshable materialized view](/materialized-view/refreshable-materialized-view), which enables you to schedule query execution for deduplicating rows and storing the results in a destination table. With each scheduled refresh, the destination table is replaced with the latest query results.

The key advantage of this method is that the query using the FINAL keyword runs only once during the refresh, eliminating the need for subsequent queries on the destination table to use FINAL.

However, a drawback is that the data in the destination table is only as up-to-date as the most recent refresh. That said, for many use cases, refresh intervals ranging from several minutes to a few hours may be sufficient.

```sql
-- Create deduplicated posts table 
CREATE TABLE deduplicated_posts AS posts;

-- Create the Materialized view and schedule to run every hour
CREATE MATERIALIZED VIEW deduplicated_posts_mv REFRESH EVERY 1 HOUR TO deduplicated_posts AS 
SELECT * FROM posts FINAL WHERE _peerdb_is_deleted=0 
```

Then, you can query the table `deduplicated_posts` normally.

```sql
SELECT
    sum(viewcount) AS viewcount,
    owneruserid
FROM deduplicated_posts
WHERE owneruserid > 0
GROUP BY owneruserid
ORDER BY viewcount DESC
LIMIT 10;
```
