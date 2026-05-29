---
title: 'Best practices for migrating from BigQuery to ClickHouse Cloud'
slug: /migrations/bigquery/best-practices
description: 'Best practices to follow when migrating from BigQuery to ClickHouse Cloud'
keywords: ['BigQuery', 'migration', 'best practices']
show_related_blogs: true
sidebar_label: 'Best practices'
doc_type: 'guide'
---

import bigquery_5 from '@site/static/images/migrations/bigquery-5.png';
import bigquery_6 from '@site/static/images/migrations/bigquery-6.png';
import bigquery_7 from '@site/static/images/migrations/bigquery-7.png';
import bigquery_8 from '@site/static/images/migrations/bigquery-8.png';
import bigquery_9 from '@site/static/images/migrations/bigquery-9.png';
import bigquery_10 from '@site/static/images/migrations/bigquery-10.png';
import bigquery_11 from '@site/static/images/migrations/bigquery-11.png';
import bigquery_12 from '@site/static/images/migrations/bigquery-12.png';
import Image from '@theme/IdealImage';

This document describes best practices for migrating from BigQuery to ClickHouse.

## Pre-requisites
You should already be familiar with the ClickHouse core and data modeling concepts explored in:
- [**Table parts**](/parts)
- [**Table partitions**](/partitions)
- [**Primary indexes**](/primary-indexes)
- [**Schema design**](/data-modeling/schema-design)


## Choosing a primary key {#how-are-clickhouse-primary-keys-different}

As in BigQuery, ClickHouse doesn't enforce uniqueness for a table's primary key column values.

Similar to clustering in BigQuery, a ClickHouse table's data is stored on disk ordered by the primary key columns. This sort order is utilized by the query optimizer to prevent resorting, minimize memory usage for joins, and enable short-circuiting for limit clauses.
In contrast to BigQuery, ClickHouse automatically creates [a (sparse) primary index](/guides/best-practices/sparse-primary-indexes) based on the primary key column values. This index is used to speed up all queries that contain filters on the primary key columns. Specifically:

- Memory and disk efficiency are paramount to the scale at which ClickHouse is often used. Data is written to ClickHouse tables in chunks known as parts, with rules applied for merging the parts in the background. In ClickHouse, each part has its own primary index. When parts are merged, then the merged part's primary indexes are also merged. Not that these indexes aren't built for each row. Instead, the primary index for a part has one index entry per group of rows - this technique is called sparse indexing.
- Sparse indexing is possible because ClickHouse stores the rows for a part on disk ordered by a specified key. Instead of directly locating single rows (like a B-Tree-based index), the sparse primary index allows it to quickly (via a binary search over index entries) identify groups of rows that could possibly match the query. The located groups of potentially matching rows are then, in parallel, streamed into the ClickHouse engine in order to find the matches. This index design allows for the primary index to be small (it completely fits into the main memory) while still significantly speeding up query execution times, especially for range queries that are typical in data analytics use cases. For more details, we recommend [this in-depth guide](/guides/best-practices/sparse-primary-indexes).

<Image img={bigquery_5} size="md" alt="ClickHouse Primary keys"/>

The selected primary key in ClickHouse will determine not only the index but also the order in which data is written on disk. Because of this, it can dramatically impact compression levels, which can, in turn, affect query performance. An ordering key that causes the values of most columns to be written in a contiguous order will allow the selected compression algorithm (and codecs) to compress the data more effectively.

> All columns in a table will be sorted based on the value of the specified ordering key, regardless of whether they're included in the key itself. For instance, if `CreationDate` is used as the key, the order of values in all other columns will correspond to the order of values in the `CreationDate` column. Multiple ordering keys can be specified - this will order with the same semantics as an `ORDER BY` clause in a `SELECT` query.

## Partitioning best practices {#partitions}

Coming from BigQuery, you'll be familiar with the concept of table partitioning for enhancing performance and manageability for large databases by dividing tables into smaller, more manageable pieces called partitions.
Partitions allow administrators to organize data based on specific criteria like date ranges or geographical locations, and can be achieved using either a range on a specified column (e.g., dates), defined lists, or via a hash on a key.

Partitioning helps with improving query performance by enabling faster data access through partition pruning and more efficient indexing.
It also helps maintenance tasks such as backups and data purges by allowing operations on individual partitions rather than the entire table.
Additionally, partitioning can significantly improve the scalability of BigQuery databases by distributing the load across multiple partitions.

In ClickHouse, partitioning is specified on a table when it is initially defined via the [`PARTITION BY`](/engines/table-engines/mergetree-family/custom-partitioning-key) clause.
This clause can contain a SQL expression on any column/s, the results of which will define which partition a row is sent to.

<Image img={bigquery_6} size="md" alt="Partitions"/>

Data parts are logically associated with each partition on disk and can be queried in isolation.
In the example below, the posts table gets partitioned by year using the expression [`toYear(CreationDate)`](/sql-reference/functions/date-time-functions#toYear).
As rows are inserted into ClickHouse, this expression will be evaluated against each row.
Rows are then routed to the resulting partition in the form of new data parts belonging to that partition.

```sql
CREATE TABLE posts
(
    `Id` Int32 CODEC(Delta(4), ZSTD(1)),
    `PostTypeId` Enum8('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
    `AcceptedAnswerId` UInt32,
    `CreationDate` DateTime64(3, 'UTC'),
...
    `ClosedDate` DateTime64(3, 'UTC')
)
ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CreationDate)
PARTITION BY toYear(CreationDate)
```

### Partitioning as a data management feature {#applications}

:::tip[TLDR]
You should consider partitioning primarily a data management technique.
It is ideal when data needs to be expired from the cluster when operating with time series data e.g. the oldest partition can [simply be dropped](/sql-reference/statements/alter/partition#drop-partitionpart).
:::

Partitioning in ClickHouse has similar applications as in BigQuery, however in ClickHouse, you should principally consider partitioning to be a data management feature, not a query optimization technique.
By separating data logically based on a key, each partition can be operated on independently. This is useful for example when you want to delete it using TTL.
It also allows you to move partitions, and thus subsets, between [storage tiers](/integrations/s3#storage-tiers) efficiently on time or [expire data/efficiently delete from the cluster](/sql-reference/statements/alter/partition).

In the example below, posts from 2008 are removed:

```sql
SELECT DISTINCT partition
FROM system.parts
WHERE `table` = 'posts'

┌─partition─┐
│ 2008      │
│ 2009      │
│ 2010      │
│ 2011      │
│ 2012      │
│ 2013      │
│ 2014      │
│ 2015      │
│ 2016      │
│ 2017      │
│ 2018      │
│ 2019      │
│ 2020      │
│ 2021      │
│ 2022      │
│ 2023      │
│ 2024      │
└───────────┘

17 rows in set. Elapsed: 0.002 sec.

ALTER TABLE posts
(DROP PARTITION '2008')

Ok.

0 rows in set. Elapsed: 0.103 sec.
```

### Partitioning as a query optimization technique {#query-optimization}

:::warning[Use partitioning for query optimization with care]
Ensure your partitioning key expression doesn't result in a high cardinality set i.e. creating more than 100 partitions should be avoided.
For example, don't partition your data by high cardinality columns such as client identifiers or names.
Instead, make a client identifier or name the first column in the `ORDER BY` expression.
:::

While partitioning in ClickHouse should be considered primarily a data management technique, it can in some situations help with query performance.
This depends heavily on the access patterns. If queries target only a few partitions (ideally a single partition), performance can potentially improve.
This is only typically useful if the partitioning key isn't in the primary key, and you're filtering on it.

Note however that queries that need to cover many partitions may perform _worse_ than if no partitioning is used.
This is because there may be more parts created as a result of partitioning.

Internally, ClickHouse [creates parts](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design) for inserted data.
As more data is inserted, the number of parts increases.
In order to prevent an excessively high number of parts, which will degrade query performance (because there are more files to read), parts are merged together in an asynchronous background process.
If the number of parts exceeds a [pre-configured limit](/operations/settings/merge-tree-settings#parts_to_throw_insert), then ClickHouse will throw an exception on insert as a ["too many parts" error](/knowledgebase/exception-too-many-parts).
This shouldn't happen under normal operation and only occurs if ClickHouse is misconfigured or used incorrectly e.g. many small inserts.
Since parts are created per partition in isolation, increasing the number of partitions causes the number of parts to increase i.e. it is a multiple of the number of partitions.
High cardinality partitioning keys can, therefore, cause this error and should be avoided.

The benefit of targeting a single partition will be less pronounced, even non-existent, if the partitioning key is already an early entry in the primary key.

Partitioning can also be used to [optimize `GROUP BY` queries](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key) if values in each partition are unique.
In general, you should ensure your primary key is optimized, and **only consider partitioning as a query optimization technique in exceptional cases** where access patterns access a specific predictable subset of the day, e.g., partitioning by day, with most queries in the last day.

## Using materialized views and projections {#materialized-views-vs-projections}

ClickHouse's concept of projections allows you to specify multiple `ORDER BY` clauses for a table.

In [ClickHouse data modeling](/data-modeling/schema-design), we explore how materialized views can be used
in ClickHouse to pre-compute aggregations, transform rows, and optimize queries
for different access patterns. For the latter, we [provided an example](/materialized-view/incremental-materialized-view#lookup-table) where
the materialized view sends rows to a target table with a different ordering key
to the original table receiving inserts.

For example, consider the following query:

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
   │ 0.18181818181818182 │
   └─────────────────────┘
--highlight-next-line
1 row in set. Elapsed: 0.040 sec. Processed 90.38 million rows, 361.59 MB (2.25 billion rows/s., 9.01 GB/s.)
Peak memory usage: 201.93 MiB.
```

This query requires all 90m rows to be scanned (albeit quickly) as the `UserId`
isn't the ordering key. Previously, we solved this using a materialized view
acting as a lookup for the `PostId`.

The same problem can also be solved with a projection.
The command below adds a projection with `ORDER BY user_id`.

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

Note that we have to first create the projection and then materialize it.
This latter command causes the data to be stored twice on disk in two different
orders.

The projection can also be defined when the data is created, and will be automatically maintained as data is inserted.
This is shown below:

```sql
CREATE TABLE comments
(
    `Id` UInt32,
    `PostId` UInt32,
    `Score` UInt16,
    `Text` String,
    `CreationDate` DateTime64(3, 'UTC'),
    `UserId` Int32,
    `UserDisplayName` LowCardinality(String),
    --highlight-begin
    PROJECTION comments_user_id
    (
    SELECT *
    ORDER BY UserId
    )
    --highlight-end
)
ENGINE = MergeTree
ORDER BY PostId
```

If the projection is created via an `ALTER` command, the creation is asynchronous
when the `MATERIALIZE PROJECTION` command is issued. You can confirm the progress
of this operation with the following query, waiting for `is_done=1`.

```sql
SELECT
    parts_to_do,
    is_done,
    latest_fail_reason
FROM system.mutations
WHERE (`table` = 'comments') AND (command LIKE '%MATERIALIZE%')

   ┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
1. │           1 │       0 │                    │
   └─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

Repeating the above query, you can see that performance has improved significantly
at the expense of additional storage.

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
1. │ 0.18181818181818182 │
   └─────────────────────┘
--highlight-next-line
1 row in set. Elapsed: 0.008 sec. Processed 16.36 thousand rows, 98.17 KB (2.15 million rows/s., 12.92 MB/s.)
Peak memory usage: 4.06 MiB.
```

With an [`EXPLAIN` command](/sql-reference/statements/explain), you can also confirm the projection was used to serve this query:

```sql
EXPLAIN indexes = 1
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

    ┌─explain─────────────────────────────────────────────┐
 1. │ Expression ((Projection + Before ORDER BY))         │
 2. │   Aggregating                                       │
 3. │   Filter                                            │
 4. │           ReadFromMergeTree (comments_user_id)      │
 5. │           Indexes:                                  │
 6. │           PrimaryKey                                │
 7. │           Keys:                                     │
 8. │           UserId                                    │
 9. │           Condition: (UserId in [8592047, 8592047]) │
10. │           Parts: 2/2                                │
11. │           Granules: 2/11360                         │
    └─────────────────────────────────────────────────────┘

11 rows in set. Elapsed: 0.004 sec.
```

### When to use projections {#when-to-use-projections}

Projections are an appealing feature for new users as they're automatically
maintained as data is inserted. Furthermore, queries can just be sent to a single
table where the projections are exploited where possible to speed up the response
time.

<Image img={bigquery_7} size="md" alt="Projections"/>

This is in contrast to materialized views, where the user has to select the
appropriate optimized target table or rewrite their query, depending on the filters.
This places greater emphasis on user applications and increases client-side
complexity.

Despite these advantages, projections come with some inherent limitations which
you should be aware of and thus should be deployed sparingly. For further
details see ["materialized views versus projections"](/managing-data/materialized-views-versus-projections)

We recommend using projections when:

- A complete reordering of the data is required. While the expression in the projection can, in theory, use a `GROUP BY,` materialized views are more effective for maintaining aggregates. The query optimizer is also more likely to exploit projections that use a simple reordering, i.e., `SELECT * ORDER BY x`. You can select a subset of columns in this expression to reduce storage footprint.
- Users are comfortable with the associated increase in storage footprint and overhead of writing data twice. Test the impact on insertion speed and [evaluate the storage overhead](/data-compression/compression-in-clickhouse).

## Rewriting BigQuery queries in ClickHouse {#rewriting-bigquery-queries-in-clickhouse}

The following provides example queries comparing BigQuery to ClickHouse. This list aims to demonstrate how to exploit ClickHouse features to significantly simplify queries. The examples here use the full Stack Overflow dataset (up to April 2024).

**Users (with more than 10 questions) which receive the most views:**

_BigQuery_

<Image img={bigquery_8} size="sm" alt="Rewriting BigQuery queries" border/>

_ClickHouse_

```sql
SELECT
    OwnerDisplayName,
    sum(ViewCount) AS total_views
FROM stackoverflow.posts
WHERE (PostTypeId = 'Question') AND (OwnerDisplayName != '')
GROUP BY OwnerDisplayName
HAVING count() > 10
ORDER BY total_views DESC
LIMIT 5

   ┌─OwnerDisplayName─┬─total_views─┐
1. │ Joan Venge       │    25520387 │
2. │ Ray Vega         │    21576470 │
3. │ anon             │    19814224 │
4. │ Tim              │    19028260 │
5. │ John             │    17638812 │
   └──────────────────┴─────────────┘

5 rows in set. Elapsed: 0.076 sec. Processed 24.35 million rows, 140.21 MB (320.82 million rows/s., 1.85 GB/s.)
Peak memory usage: 323.37 MiB.
```

**Which tags receive the most views:**

_BigQuery_

<br />

<Image img={bigquery_9} size="sm" alt="BigQuery 1" border/>

_ClickHouse_

```sql
-- ClickHouse
SELECT
    arrayJoin(arrayFilter(t -> (t != ''), splitByChar('|', Tags))) AS tags,
    sum(ViewCount) AS views
FROM stackoverflow.posts
GROUP BY tags
ORDER BY views DESC
LIMIT 5

   ┌─tags───────┬──────views─┐
1. │ javascript │ 8190916894 │
2. │ python     │ 8175132834 │
3. │ java       │ 7258379211 │
4. │ c#         │ 5476932513 │
5. │ android    │ 4258320338 │
   └────────────┴────────────┘

5 rows in set. Elapsed: 0.318 sec. Processed 59.82 million rows, 1.45 GB (188.01 million rows/s., 4.54 GB/s.)
Peak memory usage: 567.41 MiB.
```

## Aggregate functions {#aggregate-functions}

Where possible, you should exploit ClickHouse aggregate functions. Below, we show the use of the [`argMax` function](/sql-reference/aggregate-functions/reference/argmax) to compute the most viewed question of each year.

_BigQuery_

<Image img={bigquery_10} border size="sm" alt="Aggregate functions 1"/>

<Image img={bigquery_11} border size="sm" alt="Aggregate functions 2"/>

_ClickHouse_

```sql
-- ClickHouse
SELECT
    toYear(CreationDate) AS Year,
    argMax(Title, ViewCount) AS MostViewedQuestionTitle,
    max(ViewCount) AS MaxViewCount
FROM stackoverflow.posts
WHERE PostTypeId = 'Question'
GROUP BY Year
ORDER BY Year ASC
FORMAT Vertical

Row 1:
──────
Year:                    2008
MostViewedQuestionTitle: How to find the index for a given item in a list?
MaxViewCount:            6316987

Row 2:
──────
Year:                    2009
MostViewedQuestionTitle: How do I undo the most recent local commits in Git?
MaxViewCount:            13962748

...

Row 16:
───────
Year:                    2023
MostViewedQuestionTitle: How do I solve "error: externally-managed-environment" every time I use pip 3?
MaxViewCount:            506822

Row 17:
───────
Year:                    2024
MostViewedQuestionTitle: Warning "Third-party cookie will be blocked. Learn more in the Issues tab"
MaxViewCount:            66975

17 rows in set. Elapsed: 0.225 sec. Processed 24.35 million rows, 1.86 GB (107.99 million rows/s., 8.26 GB/s.)
Peak memory usage: 377.26 MiB.
```

## Conditionals and arrays {#conditionals-and-arrays}

Conditional and array functions make queries significantly simpler. The following query computes the tags (with more than 10000 occurrences) with the largest percentage increase from 2022 to 2023. Note how the following ClickHouse query is succinct thanks to conditionals, array functions, and the ability to reuse aliases in the `HAVING` and `SELECT` clauses.

_BigQuery_

<Image img={bigquery_12} size="sm" border alt="Conditionals and Arrays"/>

_ClickHouse_

```sql
SELECT
    arrayJoin(arrayFilter(t -> (t != ''), splitByChar('|', Tags))) AS tag,
    countIf(toYear(CreationDate) = 2023) AS count_2023,
    countIf(toYear(CreationDate) = 2022) AS count_2022,
    ((count_2023 - count_2022) / count_2022) * 100 AS percent_change
FROM stackoverflow.posts
WHERE toYear(CreationDate) IN (2022, 2023)
GROUP BY tag
HAVING (count_2022 > 10000) AND (count_2023 > 10000)
ORDER BY percent_change DESC
LIMIT 5

┌─tag─────────┬─count_2023─┬─count_2022─┬──────percent_change─┐
│ next.js     │      13788 │      10520 │   31.06463878326996 │
│ spring-boot │      16573 │      17721 │  -6.478189718413183 │
│ .net        │      11458 │      12968 │ -11.644046884639112 │
│ azure       │      11996 │      14049 │ -14.613139725247349 │
│ docker      │      13885 │      16877 │  -17.72826924216389 │
└─────────────┴────────────┴────────────┴─────────────────────┘

5 rows in set. Elapsed: 0.096 sec. Processed 5.08 million rows, 155.73 MB (53.10 million rows/s., 1.63 GB/s.)
Peak memory usage: 410.37 MiB.
```
