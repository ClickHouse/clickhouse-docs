---
slug: /migrations/postgresql/dataset
title: 'Migrating data'
description: 'Dataset example to migrate from PostgreSQL to ClickHouse'
keywords: ['Postgres']
show_related_blogs: true
doc_type: explanation
---

import postgres_stackoverflow_schema from '@site/static/images/migrations/postgres-stackoverflow-schema.png';
import Image from '@theme/IdealImage';

> This is **Part 1** of a guide on migrating from PostgreSQL to ClickHouse. Using a practical example, it demonstrates how to efficiently carry out the migration with a real-time replication (CDC) approach. Many of the concepts covered are also applicable to manual bulk data transfers from PostgreSQL to ClickHouse.

## Dataset {#dataset}

As an example dataset to show a typical migration from Postgres to ClickHouse, we use the Stack Overflow dataset documented [here](/getting-started/example-datasets/stackoverflow). This contains every `post`, `vote`, `user`, `comment`, and `badge` that has occurred on Stack Overflow from 2008 to Apr 2024. The PostgreSQL schema for this data is shown below:

<Image img={postgres_stackoverflow_schema} size="lg" alt="PostgreSQL Stack Overflow schema"/>

*DDL commands to create the tables in PostgreSQL are available [here](https://pastila.nl/?001c0102/eef2d1e4c82aab78c4670346acb74d83#TeGvJWX9WTA1V/5dVVZQjg==).*

This schema, while not necessarily the most optimal, exploits a number of popular PostgreSQL features, including primary keys, foreign keys, partitioning, and indexes.

We will migrate each of these concepts to their ClickHouse equivalents.

For those users who wish to populate this dataset into a PostgreSQL instance to test migration steps, we have provided the data in `pg_dump` format for download with the DDL, and subsequent data load commands are shown below:

```bash
# users
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/users.sql.gz
gzip -d users.sql.gz
psql < users.sql

# posts
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/posts.sql.gz
gzip -d posts.sql.gz
psql < posts.sql

# posthistory
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/posthistory.sql.gz
gzip -d posthistory.sql.gz
psql < posthistory.sql

# comments
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/comments.sql.gz
gzip -d comments.sql.gz
psql < comments.sql

# votes
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/votes.sql.gz
gzip -d votes.sql.gz
psql < votes.sql

# badges
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/badges.sql.gz
gzip -d badges.sql.gz
psql < badges.sql

# postlinks
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/postlinks.sql.gz
gzip -d postlinks.sql.gz
psql < postlinks.sql
```

While small for ClickHouse, this dataset is substantial for Postgres. The above represents a subset covering the first three months of 2024.

> While our example results use the full dataset to show performance differences between Postgres and Clickhouse, all steps documented below are functionally identical with the smaller subset. Users wanting to load the full dataset into Postgres see [here](https://pastila.nl/?00d47a08/1c5224c0b61beb480539f15ac375619d#XNj5vX3a7ZjkdiX7In8wqA==). Due to the foreign constraints imposed by the above schema, the full dataset for PostgreSQL only contains rows that satisfy referential integrity. A [Parquet version](/getting-started/example-datasets/stackoverflow), with no such constraints, can be easily loaded directly into ClickHouse if needed.

## Migrating data {#migrating-data}

### Real time replication (CDC) {#real-time-replication-or-cdc}

Refer to this [guide](/integrations/clickpipes/postgres) to set up ClickPipes for PostgreSQL. The guide is covering many different types of source Postgres instances.

With CDC approach using ClickPipes or PeerDB, each tables in the PostgreSQL database are automatically replicated in ClickHouse. 

To handle updates and deletes in near real-time, ClickPipes maps Postgres tables to ClickHouse using [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) engine, specifically designed to handle updates and deletes in ClickHouse. You can find more information on how the data gets replicated to ClickHouse using ClickPipes [here](/integrations/clickpipes/postgres/deduplication#how-does-data-get-replicated). It is important to note that replication using CDC creates duplicated rows in ClickHouse when replicating updates or deletes operations. [See techniques](/integrations/clickpipes/postgres/deduplication#deduplicate-using-final-keyword) using the [FINAL](https://clickhouse.com/docs/sql-reference/statements/select/from#final-modifier) modifier for handling those in ClickHouse.

Let's have a look on how the table `users` is created in ClickHouse using ClickPipes. 

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

Once set up, ClickPipes starts migrating all data from PostgreSQL to ClickHouse. Depending on the network and size of the deployments, this should take only a few minutes for the Stack Overflow dataset. 

### Manual bulk load with periodic updates {#initial-bulk-load-with-periodic-updates}

Using a manual approach, the initial bulk load of the dataset can be achieved via:

- **Table functions** - Using the [Postgres table function](/sql-reference/table-functions/postgresql) in ClickHouse to `SELECT` data from Postgres and `INSERT` it into a ClickHouse table. Relevant to bulk loads up to datasets of several hundred GB.
- **Exports** - Exporting to intermediary formats such as CSV or SQL script file. These files can then be loaded into ClickHouse from either the client via the `INSERT FROM INFILE` clause or using object storage and their associated functions i.e. s3, gcs.

When loading data manually from PostgreSQL, you need to first create the tables in ClickHouse. Refer to this [Data Modeling documentation](/data-modeling/schema-design#establish-initial-schema) to that also uses the Stack Overflow dataset to optimize the table schema in ClickHouse. 

Data types between PostgreSQL and ClickHouse might differ. To establish the equivalent types for each of the table columns, we can use the `DESCRIBE` command with the [Postgres table function](/sql-reference/table-functions/postgresql). The following command describe the table `posts` in PostgreSQL, modify it according to your environment:

```sql title="Query"
DESCRIBE TABLE postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
SETTINGS describe_compact_output = 1
```

For an overview of data type mapping between PostgreSQL and ClickHouse, refer to the [appendix documentation](/migrations/postgresql/appendix#data-type-mappings).

The steps for optimizing the types for this schema are identical to if the data has been loaded from other sources e.g. Parquet on S3. Applying the process described in this [alternate guide using Parquet](/data-modeling/schema-design) results in the following schema:

```sql title="Query"
CREATE TABLE stackoverflow.posts
(
   `Id` Int32,
   `PostTypeId` Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
   `AcceptedAnswerId` UInt32,
   `CreationDate` DateTime,
   `Score` Int32,
   `ViewCount` UInt32,
   `Body` String,
   `OwnerUserId` Int32,
   `OwnerDisplayName` String,
   `LastEditorUserId` Int32,
   `LastEditorDisplayName` String,
   `LastEditDate` DateTime,
   `LastActivityDate` DateTime,
   `Title` String,
   `Tags` String,
   `AnswerCount` UInt16,
   `CommentCount` UInt8,
   `FavoriteCount` UInt8,
   `ContentLicense`LowCardinality(String),
   `ParentId` String,
   `CommunityOwnedDate` DateTime,
   `ClosedDate` DateTime
)
ENGINE = MergeTree
ORDER BY tuple()
COMMENT 'Optimized types'
```

We can populate this with a simple `INSERT INTO SELECT`, reading the data from PostgresSQL and inserting into ClickHouse:

```sql title="Query"
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
0 rows in set. Elapsed: 146.471 sec. Processed 59.82 million rows, 83.82 GB (408.40 thousand rows/s., 572.25 MB/s.)
```

Incremental loads can, in turn, be scheduled. If the Postgres table only receives inserts and an incrementing id or timestamp exists, users can use the above table function approach to load increments, i.e. a `WHERE` clause can be applied to the `SELECT`.  This approach may also be used to support updates if these are guaranteed to update the same column. Supporting deletes will, however, require a complete reload, which may be difficult to achieve as the table grows.

We demonstrate an initial load and incremental load using the `CreationDate` (we assume this gets updated if rows are updated)..

```sql
-- initial load
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password')

INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password') WHERE CreationDate > ( SELECT (max(CreationDate) FROM stackoverflow.posts)
```

> ClickHouse will push down simple `WHERE` clauses such as `=`, `!=`, `>`,`>=`, `<`, `<=`, and IN to the PostgreSQL server. Incremental loads can thus be made more efficient by ensuring an index exists on columns used to identify the change set.

> A possible method to detect UPDATE operations when using query replication is using the [`XMIN` system column](https://www.postgresql.org/docs/9.1/ddl-system-columns.html) (transaction IDs) as a watermark - a change in this column is indicative of a change and therefore can be applied to the destination table. Users employing this approach should be aware that `XMIN` values can wrap around and comparisons require a full table scan, making tracking changes more complex.

[Click here for Part 2](./rewriting-queries.md)
