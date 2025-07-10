---
slug: /best-practices/use-data-skipping-indices-where-appropriate
sidebar_position: 10
sidebar_label: 'Data Skipping Indices'
title: 'Use data skipping indices where appropriate'
description: 'Page describing how and when to use data skipping indices'
keywords: ['data skipping index', 'skip index']
show_related_blogs: true
---

import Image from '@theme/IdealImage';
import building_skipping_indices from '@site/static/images/bestpractices/building_skipping_indices.gif';
import using_skipping_indices from '@site/static/images/bestpractices/using_skipping_indices.gif';

Data skipping indices should be considered when previous best practices have been followed i.e. types are optimized, a good primary key has been selected and materialized views have been exploited.

These types of indices can be used to accelerate query performance if used carefully with an understanding of how they work.

ClickHouse provides a powerful mechanism called **data skipping indices** that can dramatically reduce the amount of data scanned during query execution - particularly when the primary key isn't helpful for a specific filter condition. Unlike traditional databases that rely on row-based secondary indexes (like B-trees), ClickHouse is a column-store and doesn't store row locations in a way that supports such structures. Instead, it uses skip indexes, which help it avoid reading blocks of data guaranteed not to match a query's filtering conditions.

Skip indexes work by storing metadata about blocks of data - such as min/max values, value sets, or Bloom filter representations- and using this metadata during query execution to determine which data blocks can be skipped entirely. They apply only to the [MergeTree family](/engines/table-engines/mergetree-family/mergetree) of table engines and are defined using an expression, an index type, a name, and a granularity that defines the size of each indexed block. These indexes are stored alongside the table data and are consulted when the query filter matches the index expression.

There are several types of data skipping indexes, each suited to different types of queries and data distributions:

* **minmax**: Tracks the minimum and maximum value of an expression per block. Ideal for range queries on loosely sorted data.
* **set(N)**: Tracks a set of values up to a specified size N for each block. Effective on columns with low cardinality per blocks.
* **bloom_filter**: Probabilistically determines if a value exists in a block, allowing fast approximate filtering for set membership. Effective for optimizing queries looking for the “needle in a haystack”, where a positive match is needed.
* **tokenbf_v1 / ngrambf_v1**: Specialized Bloom filter variants designed for searching tokens or character sequences in strings - particularly useful for log data or text search use cases.

While powerful, skip indexes must be used with care. They only provide benefit when they eliminate a meaningful number of data blocks, and can actually introduce overhead if the query or data structure doesn't align. If even a single matching value exists in a block, that entire block must still be read.

**Effective skip index usage often depends on a strong correlation between the indexed column and the table's primary key, or inserting data in a way that groups similar values together.**

In general, data skipping indices are best applied after ensuring proper primary key design and type optimization. They are particularly useful for:

* Columns with high overall cardinality but low cardinality within a block.
* Rare values that are critical for search (e.g. error codes, specific IDs).
* Cases where filtering occurs on non-primary key columns with localized distribution.

Always:

1. test skip indexes on real data with realistic queries. Try different index types and granularity values.
2. Evaluate their impact using tools like send_logs_level='trace' and `EXPLAIN indexes=1` to view index effectiveness. 
3. Always evaluate the size of an index and how it is impacted by granularity. Reducing granularity size often will improve performance to a point, resulting in more granules being filtered and needing to be scanned. However, as index size increases with lower granularity performance can also degrade. Measure the performance and index size for various granularity data points. This is particularly pertinent on bloom filter indexes.

<p/>
**When used appropriately, skip indexes can provide a substantial performance boost - when used blindly, they can add unnecessary cost.**

For a more detailed guide on Data Skipping Indices see [here](/sql-reference/statements/alter/skipping-index).

## Example {#example}

Consider the following optimized table. This contains Stack Overflow data with a row per post.

```sql
CREATE TABLE stackoverflow.posts
(
  `Id` Int32 CODEC(Delta(4), ZSTD(1)),
  `PostTypeId` Enum8('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
  `AcceptedAnswerId` UInt32,
  `CreationDate` DateTime64(3, 'UTC'),
  `Score` Int32,
  `ViewCount` UInt32 CODEC(Delta(4), ZSTD(1)),
  `Body` String,
  `OwnerUserId` Int32,
  `OwnerDisplayName` String,
  `LastEditorUserId` Int32,
  `LastEditorDisplayName` String,
  `LastEditDate` DateTime64(3, 'UTC') CODEC(Delta(8), ZSTD(1)),
  `LastActivityDate` DateTime64(3, 'UTC'),
  `Title` String,
  `Tags` String,
  `AnswerCount` UInt16 CODEC(Delta(2), ZSTD(1)),
  `CommentCount` UInt8,
  `FavoriteCount` UInt8,
  `ContentLicense` LowCardinality(String),
  `ParentId` String,
  `CommunityOwnedDate` DateTime64(3, 'UTC'),
  `ClosedDate` DateTime64(3, 'UTC')
)
ENGINE = MergeTree
PARTITION BY toYear(CreationDate)
ORDER BY (PostTypeId, toDate(CreationDate))
```

This table is optimized for queries which filter and aggregate by post type and date. Suppose we wished to count the number of posts with over 10,000,000 views published after 2009.

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1 row in set. Elapsed: 0.720 sec. Processed 59.55 million rows, 230.23 MB (82.66 million rows/s., 319.56 MB/s.)
```

This query is able to exclude some of the rows (and granules) using the primary index. However, the majority of rows still need to be read as indicated by the above response and following `EXPLAIN indexes=1`:

```sql
EXPLAIN indexes = 1
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)
LIMIT 1

┌─explain──────────────────────────────────────────────────────────┐
│ Expression ((Project names + Projection))                        │
│   Limit (preliminary LIMIT (without OFFSET))                     │
│     Aggregating                                                  │
│       Expression (Before GROUP BY)                               │
│         Expression                                               │
│           ReadFromMergeTree (stackoverflow.posts)                │
│           Indexes:                                               │
│             MinMax                                               │
│               Keys:                                              │
│                 CreationDate                                     │
│               Condition: (CreationDate in ('1230768000', +Inf))  │
│               Parts: 123/128                                     │
│               Granules: 8513/8545                                │
│             Partition                                            │
│               Keys:                                              │
│                 toYear(CreationDate)                             │
│               Condition: (toYear(CreationDate) in [2009, +Inf))  │
│               Parts: 123/123                                     │
│               Granules: 8513/8513                                │
│             PrimaryKey                                           │
│               Keys:                                              │
│                 toDate(CreationDate)                             │
│               Condition: (toDate(CreationDate) in [14245, +Inf)) │
│               Parts: 123/123                                     │
│               Granules: 8513/8513                                │
└──────────────────────────────────────────────────────────────────┘

25 rows in set. Elapsed: 0.070 sec.
```

A simple analysis shows that `ViewCount` is correlated with the `CreationDate` (a primary key) as one might expect - the longer a post exists, the more time it has to be viewed.

```sql
SELECT toDate(CreationDate) AS day, avg(ViewCount) AS view_count FROM stackoverflow.posts WHERE day > '2009-01-01'  GROUP BY day
```

This therefore makes a logical choice for a data skipping index. Given the numeric type, a min_max index makes sense. We add an index using the following `ALTER TABLE` commands - first adding it, then "materializing it".

```sql
ALTER TABLE stackoverflow.posts
  (ADD INDEX view_count_idx ViewCount TYPE minmax GRANULARITY 1);

ALTER TABLE stackoverflow.posts MATERIALIZE INDEX view_count_idx;
```

This index could have also been added during initial table creation. The schema with the min max index defined as part of the DDL:

```sql
CREATE TABLE stackoverflow.posts
(
  `Id` Int32 CODEC(Delta(4), ZSTD(1)),
  `PostTypeId` Enum8('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
  `AcceptedAnswerId` UInt32,
  `CreationDate` DateTime64(3, 'UTC'),
  `Score` Int32,
  `ViewCount` UInt32 CODEC(Delta(4), ZSTD(1)),
  `Body` String,
  `OwnerUserId` Int32,
  `OwnerDisplayName` String,
  `LastEditorUserId` Int32,
  `LastEditorDisplayName` String,
  `LastEditDate` DateTime64(3, 'UTC') CODEC(Delta(8), ZSTD(1)),
  `LastActivityDate` DateTime64(3, 'UTC'),
  `Title` String,
  `Tags` String,
  `AnswerCount` UInt16 CODEC(Delta(2), ZSTD(1)),
  `CommentCount` UInt8,
  `FavoriteCount` UInt8,
  `ContentLicense` LowCardinality(String),
  `ParentId` String,
  `CommunityOwnedDate` DateTime64(3, 'UTC'),
  `ClosedDate` DateTime64(3, 'UTC'),
  INDEX view_count_idx ViewCount TYPE minmax GRANULARITY 1 --index here
)
ENGINE = MergeTree
PARTITION BY toYear(CreationDate)
ORDER BY (PostTypeId, toDate(CreationDate))
```

The following animation illustrates how our minmax skipping index is built for the example table, tracking the minimum and maximum `ViewCount` values for each block of rows (granule) in the table:

<Image img={building_skipping_indices} size="lg" alt="Building skipping indices"/>

Repeating our earlier query shows significant performance improvements. Notice all the reduced number of rows scanned:

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1 row in set. Elapsed: 0.012 sec. Processed 39.11 thousand rows, 321.39 KB (3.40 million rows/s., 27.93 MB/s.)
```

An `EXPLAIN indexes=1` confirms use of the index.

```sql
EXPLAIN indexes = 1
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─explain────────────────────────────────────────────────────────────┐
│ Expression ((Project names + Projection))                          │
│   Aggregating                                                      │
│     Expression (Before GROUP BY)                                   │
│       Expression                                                   │
│         ReadFromMergeTree (stackoverflow.posts)                    │
│         Indexes:                                                   │
│           MinMax                                                   │
│             Keys:                                                  │
│               CreationDate                                         │
│             Condition: (CreationDate in ('1230768000', +Inf))      │
│             Parts: 123/128                                         │
│             Granules: 8513/8545                                    │
│           Partition                                                │
│             Keys:                                                  │
│               toYear(CreationDate)                                 │
│             Condition: (toYear(CreationDate) in [2009, +Inf))      │
│             Parts: 123/123                                         │
│             Granules: 8513/8513                                    │
│           PrimaryKey                                               │
│             Keys:                                                  │
│               toDate(CreationDate)                                 │
│             Condition: (toDate(CreationDate) in [14245, +Inf))     │
│             Parts: 123/123                                         │
│             Granules: 8513/8513                                    │
│           Skip                                                     │
│             Name: view_count_idx                                   │
│             Description: minmax GRANULARITY 1                      │
│             Parts: 5/123                                           │
│             Granules: 23/8513                                      │
└────────────────────────────────────────────────────────────────────┘

29 rows in set. Elapsed: 0.211 sec.
```

We also show an animation how the minmax skipping index prunes all row blocks that cannot possibly contain matches for the `ViewCount` > 10,000,000 predicate in our example query:

<Image img={using_skipping_indices} size="lg" alt="Using skipping indices"/>
