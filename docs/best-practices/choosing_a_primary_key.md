---
slug: /best-practices/choosing-a-primary-key
sidebar_position: 10
sidebar_label: 'Choosing a Primary Key'
title: 'Choosing a Primary Key'
description: 'Page describing how to choose a primary key in ClickHouse'
keywords: ['primary key']
show_related_blogs: true
doc_type: 'explanation'
---

import Image from '@theme/IdealImage';
import create_primary_key from '@site/static/images/bestpractices/create_primary_key.gif';
import primary_key from '@site/static/images/bestpractices/primary_key.gif';

> We interchangeably use the term "ordering key" to refer to the "primary key" on this page. Strictly, [these differ in ClickHouse](/engines/table-engines/mergetree-family/mergetree#choosing-a-primary-key-that-differs-from-the-sorting-key), but for the purposes of this document, readers can use them interchangeably, with the ordering key referring to the columns specified in the table `ORDER BY`.

Note that a ClickHouse primary key works [very differently](/migrations/postgresql/data-modeling-techniques#primary-ordering-keys-in-clickhouse) to those familiar with similar terms in OLTP databases such as Postgres.

Choosing an effective primary key in ClickHouse is crucial for query performance and storage efficiency. ClickHouse organizes data into parts, each containing its own sparse primary index. This index significantly speeds up queries by reducing the volume of data scanned. Additionally, because the primary key determines the physical order of data on disk, it directly impacts compression efficiency. Optimally ordered data compresses more effectively, which further enhances performance by reducing I/O.

1. When selecting an ordering key, prioritize columns frequently used in query filters (i.e. the `WHERE` clause), especially those that exclude large numbers of rows.
2. Columns highly correlated with other data in the table are also beneficial, as contiguous storage improves compression ratios and memory efficiency during `GROUP BY` and `ORDER BY` operations.
<br/>
Some simple rules can be applied to help choose an ordering key. The following can sometimes be in conflict, so consider these in order. **Users can identify a number of keys from this process, with 4-5 typically sufficient**:

:::note Important
Ordering keys must be defined on table creation and cannot be added. Additional ordering can be added to a table after (or before) data insertion through a feature known as projections. Be aware these result in data duplication. Further details [here](/sql-reference/statements/alter/projection).
:::

## Example {#example}

Consider the following `posts_unordered` table. This contains a row per Stack Overflow post.

This table has no primary key - as indicated by `ORDER BY tuple()`.

```sql
CREATE TABLE posts_unordered
(
  `Id` Int32,
  `PostTypeId` Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 
  'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
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
```

Suppose a user wishes to compute the number of questions submitted after 2024, with this representing their most common access pattern.

```sql
SELECT count()
FROM stackoverflow.posts_unordered
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')

┌─count()─┐
│  192611 │
└─────────┘
--highlight-next-line
1 row in set. Elapsed: 0.055 sec. Processed 59.82 million rows, 361.34 MB (1.09 billion rows/s., 6.61 GB/s.)
```

Note the number of rows and bytes read by this query. Without a primary key, queries must scan the entire dataset.

Using `EXPLAIN indexes=1` confirms a full table scan due to lack of indexing.

```sql
EXPLAIN indexes = 1
SELECT count()
FROM stackoverflow.posts_unordered
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')

┌─explain───────────────────────────────────────────────────┐
│ Expression ((Project names + Projection))                 │
│   Aggregating                                             │
│     Expression (Before GROUP BY)                          │
│       Expression                                          │
│         ReadFromMergeTree (stackoverflow.posts_unordered) │
└───────────────────────────────────────────────────────────┘

5 rows in set. Elapsed: 0.003 sec.
```

Assume a table `posts_ordered`, containing the same data, is defined with an `ORDER BY` defined as `(PostTypeId, toDate(CreationDate))` i.e.

```sql
CREATE TABLE posts_ordered
(
  `Id` Int32,
  `PostTypeId` Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 
  'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
...
)
ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate))
```

`PostTypeId` has a cardinality of 8 and represents the logical choice for the first entry in our ordering key. Recognizing date granularity filtering is likely to be sufficient (it will still benefit datetime filters) so we use `toDate(CreationDate)` as the 2nd component of our key. This will also produce a smaller index as a date can be represented by 16 bits, speeding up filtering. 

The following animation shows how an optimized sparse primary index is created for the Stack Overflow posts table. Instead of indexing individual rows, the index targets blocks of rows:

<Image img={create_primary_key} size="lg" alt="Primary key" />

If the same query is repeated on a table with this ordering key:

```sql
SELECT count()
FROM stackoverflow.posts_ordered
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')

┌─count()─┐
│  192611 │
└─────────┘
--highlight-next-line
1 row in set. Elapsed: 0.013 sec. Processed 196.53 thousand rows, 1.77 MB (14.64 million rows/s., 131.78 MB/s.)
```

This query now leverages sparse indexing, significantly reducing the amount of data read and speeding up the execution time by 4x - note the reduction of rows and bytes read. 

The use of the index can be confirmed with an `EXPLAIN indexes=1`.

```sql
EXPLAIN indexes = 1
SELECT count()
FROM stackoverflow.posts_ordered
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')

┌─explain─────────────────────────────────────────────────────────────────────────────────────┐
│ Expression ((Project names + Projection))                                                   │
│   Aggregating                                                                               │
│     Expression (Before GROUP BY)                                                            │
│       Expression                                                                            │
│         ReadFromMergeTree (stackoverflow.posts_ordered)                                     │
│         Indexes:                                                                            │
│           PrimaryKey                                                                        │
│             Keys:                                                                           │
│               PostTypeId                                                                    │
│               toDate(CreationDate)                                                          │
│             Condition: and((PostTypeId in [1, 1]), (toDate(CreationDate) in [19723, +Inf))) │
│             Parts: 14/14                                                                    │
│             Granules: 39/7578                                                               │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

13 rows in set. Elapsed: 0.004 sec.
```

Additionally, we visualize how the sparse index prunes all row blocks that can't possibly contain matches for our example query:

<Image img={primary_key} size="lg" alt="Primary key" />

:::note
All columns in a table will be sorted based on the value of the specified ordering key, regardless of whether they are included in the key itself. For instance, if `CreationDate` is used as the key, the order of values in all other columns will correspond to the order of values in the `CreationDate` column. Multiple ordering keys can be specified - this will order with the same semantics as an `ORDER BY` clause in a `SELECT` query.
:::

A complete advanced guide on choosing primary keys can be found [here](/guides/best-practices/sparse-primary-indexes).

For deeper insights into how ordering keys improve compression and further optimize storage, explore the official guides on [Compression in ClickHouse](/data-compression/compression-in-clickhouse) and [Column Compression Codecs](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec).
