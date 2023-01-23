---
slug: /en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-cardinality
sidebar_label: Ordering key columns efficiently
sidebar_position: 4
description: TODO
---

# Ordering key columns efficiently

<a name="test"></a>


In a compound primary key the order of the key columns can significantly influence both:
- the efficiency of the filtering on secondary key columns in queries, and
- the compression ratio for the table's data files.

In order to demonstrate that, we will use a version of our [web traffic sample data set](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-intro.md/#data-set)
where each row contains three columns that indicate whether or not the access by an internet 'user' (`UserID` column) to a URL (`URL` column) got marked as bot traffic (`IsRobot` column).

We will use a compound primary key containing all three aforementioned columns that could be used to speed up typical web analytics queries that calculate 
- how much (percentage of) traffic to a specific URL is from bots or
- how confident we are that a specific user is (not) a bot (what percentage of traffic from that user is (not) assumed to be bot traffic)

We use this query for calculating the cardinalities of the three columns that we want to use as key columns in a compound primary key (note that we are using the [URL table function](/docs/en/sql-reference/table-functions/url.md) for querying TSV data ad-hocly without having to create a local table). Run this query in `clickhouse client`:
```sql
SELECT
    formatReadableQuantity(uniq(URL)) AS cardinality_URL,
    formatReadableQuantity(uniq(UserID)) AS cardinality_UserID,
    formatReadableQuantity(uniq(IsRobot)) AS cardinality_IsRobot
FROM
(
    SELECT
        c11::UInt64 AS UserID,
        c15::String AS URL,
        c20::UInt8 AS IsRobot
    FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
    WHERE URL != ''
)
```
The response is:
```response
┌─cardinality_URL─┬─cardinality_UserID─┬─cardinality_IsRobot─┐
│ 2.39 million    │ 119.08 thousand    │ 4.00                │
└─────────────────┴────────────────────┴─────────────────────┘

1 row in set. Elapsed: 118.334 sec. Processed 8.87 million rows, 15.88 GB (74.99 thousand rows/s., 134.21 MB/s.)
```

We can see that there is a big difference between the cardinalities, especially between the `URL` and `IsRobot` columns, and therefore the order of these columns in a compound primary key is significant for both the efficient speed up of queries filtering on that columns and for achieving optimal compression ratios for the table's column data files.

In order to demonstrate that we are creating two table versions for our bot traffic analysis data:
- a table `hits_URL_UserID_IsRobot` with the compound primary key `(URL, UserID, IsRobot)` where we order the key columns by cardinality in descending order 
- a table `hits_IsRobot_UserID_URL` with the compound primary key `(IsRobot, UserID, URL)` where we order the key columns by cardinality in ascending order 


Create the table `hits_URL_UserID_IsRobot` with the compound primary key `(URL, UserID, IsRobot)`: 
```sql
CREATE TABLE hits_URL_UserID_IsRobot
(
    `UserID` UInt32,
    `URL` String,
    `IsRobot` UInt8
)
ENGINE = MergeTree
// highlight-next-line
PRIMARY KEY (URL, UserID, IsRobot);
```

And populate it with 8.87 million rows:
```sql
INSERT INTO hits_URL_UserID_IsRobot SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```
This is the response:
```response
0 rows in set. Elapsed: 104.729 sec. Processed 8.87 million rows, 15.88 GB (84.73 thousand rows/s., 151.64 MB/s.)
```


Next, create the table `hits_IsRobot_UserID_URL` with the compound primary key `(IsRobot, UserID, URL)`:
```sql
CREATE TABLE hits_IsRobot_UserID_URL
(
    `UserID` UInt32,
    `URL` String,
    `IsRobot` UInt8
)
ENGINE = MergeTree
// highlight-next-line
PRIMARY KEY (IsRobot, UserID, URL);
```
And populate it with the same 8.87 million rows that we used to populate the previous table:

```sql
INSERT INTO hits_IsRobot_UserID_URL SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```
The response is:
```response
0 rows in set. Elapsed: 95.959 sec. Processed 8.87 million rows, 15.88 GB (92.48 thousand rows/s., 165.50 MB/s.)
```



## Efficient filtering on secondary key columns

When a query is filtering on at least one column that is part of a compound key, and is the first key column, [then ClickHouse is running the binary search algorithm over the key column's index marks](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-design.md/#the-primary-index-is-used-for-selecting-granules).

When a query is filtering (only) on a column that is part of a compound key, but is not the first key column, [then ClickHouse is using the generic exclusion search algorithm over the key column's index marks](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-multiple.md/#secondary-key-columns-can-not-be-inefficient).


For the second case the ordering of the key columns in the compound primary key is significant for the effectiveness of the [generic exclusion search algorithm](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444).

This is a query that is filtering on the `UserID` column of the table where we ordered the key columns `(URL, UserID, IsRobot)` by cardinality in descending order:
```sql
SELECT count(*)
FROM hits_URL_UserID_IsRobot
WHERE UserID = 112304
```
The response is:
```response
┌─count()─┐
│      73 │
└─────────┘

1 row in set. Elapsed: 0.026 sec.
// highlight-next-line 
Processed 7.92 million rows, 
31.67 MB (306.90 million rows/s., 1.23 GB/s.)
```

This is the same query on the table where we ordered the key columns `(IsRobot, UserID, URL)` by cardinality in ascending order:
```sql
SELECT count(*)
FROM hits_IsRobot_UserID_URL
WHERE UserID = 112304
```
The response is:
```response
┌─count()─┐
│      73 │
└─────────┘

1 row in set. Elapsed: 0.003 sec.
// highlight-next-line 
Processed 20.32 thousand rows, 
81.28 KB (6.61 million rows/s., 26.44 MB/s.)
```

We can see that the query execution is significantly more effective and faster on the table where we ordered the key columns by cardinality in ascending order.

The reason for that is that the [generic exclusion search algorithm](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444) works most effective, when [granules](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-design.md/#the-primary-index-is-used-for-selecting-granules) are selected via a secondary key column where the predecessor key column has a lower cardinality. We illustrated that in detail in a [previous section](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-multiple.md/#generic-exclusion-search-algorithm) of this guide.


## Optimal compression ratio of data files

This query compares the compression ratio of the `UserID` column between the two tables that we created above:

```sql
SELECT
    table AS Table,
    name AS Column,
    formatReadableSize(data_uncompressed_bytes) AS Uncompressed,
    formatReadableSize(data_compressed_bytes) AS Compressed,
    round(data_uncompressed_bytes / data_compressed_bytes, 0) AS Ratio
FROM system.columns
WHERE (table = 'hits_URL_UserID_IsRobot' OR table = 'hits_IsRobot_UserID_URL') AND (name = 'UserID')
ORDER BY Ratio ASC
```
This is the response:
```response
┌─Table───────────────────┬─Column─┬─Uncompressed─┬─Compressed─┬─Ratio─┐
│ hits_URL_UserID_IsRobot │ UserID │ 33.83 MiB    │ 11.24 MiB  │     3 │
│ hits_IsRobot_UserID_URL │ UserID │ 33.83 MiB    │ 877.47 KiB │    39 │
└─────────────────────────┴────────┴──────────────┴────────────┴───────┘

2 rows in set. Elapsed: 0.006 sec. 
```
We can see that the compression ratio for the `UserID` column is significantly higher for the table where we ordered the key columns `(IsRobot, UserID, URL)` by cardinality in ascending order. 

Although in both tables exactly the same data is stored (we inserted the same 8.87 million rows into both tables), the order of the key columns in the compound primary key has a significant influence on how much disk space the <a href="https://clickhouse.com/docs/en/introduction/distinctive-features/#data-compression" target="_blank">compressed</a> data in the table's [column data files](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-design.md/#data-is-stored-on-disk-ordered-by-primary-key-columns) requires:
- in the table `hits_URL_UserID_IsRobot` with the compound primary key `(URL, UserID, IsRobot)` where we order the key columns by cardinality in descending order, the `UserID.bin` data file takes **11.24 MiB** of disk space 
- in the table `hits_IsRobot_UserID_URL` with the compound primary key `(IsRobot, UserID, URL)` where we order the key columns by cardinality in ascending order, the `UserID.bin` data file takes only **877.47 KiB** of disk space 

Having a good compression ratio for the data of a table's column on disk not only saves space on disk, but also makes queries (especially analytical ones) that require the reading of data from that column faster, as less i/o is required for moving the column's data from disk to the main memory (the operating system's file cache).

In the following we illustrate why it's beneficial for the compression ratio of a table's columns to order the primary key columns by cardinality in ascending order.

The diagram below sketches the on-disk order of rows for a primary key where the key columns are ordered by cardinality in ascending order:
<img src={require('./images/sparse-primary-indexes-14a.png').default} class="image"/>

We discussed that [the table's row data is stored on disk ordered by primary key columns](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-design.md/#data-is-stored-on-disk-ordered-by-primary-key-columns).

In the diagram above, the table's rows (their column values on disk) are first ordered by their `cl` value, and rows that have the same `cl` value are ordered by their `ch` value. And because the first key column `cl` has low cardinality, it is likely that there are rows with the same `cl` value. And because of that it is also likely that `ch` values are ordered (locally - for rows with the same `cl` value).

If in a column, similar data is placed close to each other, for example via sorting, then that data will be compressed better.
In general, a compression algorithm benefits from the run length of data (the more data it sees the better for compression) 
and locality (the more similar the data is, the better the compression ratio is).

In contrast to the diagram above, the diagram below sketches the on-disk order of rows for a primary key where the key columns are ordered by cardinality in descending order:
<img src={require('./images/sparse-primary-indexes-14b.png').default} class="image"/>

Now the table's rows are first ordered by their `ch` value, and rows that have the same `ch` value are ordered by their `cl` value. 
But because the first key column `ch` has high cardinality, it is unlikely that there are rows with the same `ch` value. And because of that is is also unlikely that `cl` values are ordered (locally - for rows with the same `ch` value).

Therefore the `cl` values are most likely in random order and therefore have a bad locality and compression ration, respectively.


## Summary

For both the efficient filtering on secondary key columns in queries and the compression ratio of a table's column data files it is beneficial to order the columns in a primary key by their cardinality in ascending order.


## Related content
- Blog: [Super charging your ClickHouse queries](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes)


