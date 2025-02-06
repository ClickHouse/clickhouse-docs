---
slug: /en/partitions
title: Table partitions
description: What are table partitions in ClickHouse
keywords: [partitions, partition by]
---

## What are table partitions in ClickHouse?

<br/>


Partitions group the [data parts](/docs/en/parts) of a table in the [MergeTree engine family](/docs/en/engines/table-engines/mergetree-family) into organized, logical units, which is a way of organizing data that is conceptually meaningful and aligned with specific criteria, such as time ranges, categories, or other key attributes. These logical units make data easier to manage, query, and optimize.

### Partition By

Partitioning can be enabled when a table is initially defined via the [PARTITION BY clause](/docs/en/engines/table-engines/mergetree-family/custom-partitioning-key). This clause can contain a SQL expression on any columns, the results of which will define which partition a row belongs to.

To illustrate this, we [enhance](https://sql.clickhouse.com/?query=U0hPVyBDUkVBVEUgVEFCTEUgdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQ&run_query=true&tab=results) the [What are table parts](/docs/en/parts) example table by adding a `PARTITION BY toStartOfMonth(date)` clause, which organizes the table`s data parts based on the months of property sales:


```
CREATE TABLE uk.uk_price_paid_simple_partitioned
(
    date Date,
    town LowCardinality(String),
    street LowCardinality(String),
    price UInt32
)
ENGINE = MergeTree
ORDER BY (town, street)
PARTITION BY toStartOfMonth(date);
```

You can [query this table](https://sql.clickhouse.com/?query=U0VMRUNUICogRlJPTSB1ay51a19wcmljZV9wYWlkX3NpbXBsZV9wYXJ0aXRpb25lZA&run_query=true&tab=results) in our ClickHouse SQL Playground.

### Structure on disk

Whenever a set of rows is inserted into the table, instead of creating (at [least](/docs/en/operations/settings/settings#max_insert_block_size)) one single data part containing all the inserted rows (as described [here](/docs/en/parts)), ClickHouse creates one new data part for each unique partition key value among the inserted rows:

<img src={require('./images/partitions.png').default} alt='INSERT PROCESSING' class='image' style={{width: '100%'}} />
<br/>

The ClickHouse server first splits the rows from the example insert with 4 rows sketched in the diagram above by their partition key value `toStartOfMonth(date)`. 
Then, for each identified partition, the rows are processed as [usual](/docs/en/parts) by performing several sequential steps (① Sorting, ② Splitting into columns, ③ Compression, ④ Writing to Disk). 

Note that with partitioning enabled, ClickHouse automatically creates [MinMax indexes](https://github.com/ClickHouse/ClickHouse/blob/dacc8ebb0dac5bbfce5a7541e7fc70f26f7d5065/src/Storages/MergeTree/IMergeTreeDataPart.h#L341) for each data part. These are simply files for each table column used in the partition key expression, containing the minimum and maximum values of that column within the data part.

### Per partition merges

With partitioning enabled, ClickHouse only [merges](/docs/en/merges) data parts within, but not across partitions. We sketch that for our example table from above:

<img src={require('./images/merges_with_partitions.png').default} alt='PART MERGES' class='image' style={{width: '100%'}} />
<br/>

As sketched in the diagram above, parts belonging to different partitions are never merged. If a partition key with high cardinality is chosen, then parts spread across thousands of partitions will never be merge candidates - exceeding preconfigured limits and causing the dreaded `Too many parts` error. Addressing this problem is simple: choose a sensible partition key with [cardinality under 1000..10000](https://github.com/ClickHouse/ClickHouse/blob/ffc5b2c56160b53cf9e5b16cfb73ba1d956f7ce4/src/Storages/MergeTree/MergeTreeDataWriter.cpp#L121).

## Monitoring partitions

You can [query](https://sql.clickhouse.com/?query=U0VMRUNUIERJU1RJTkNUIF9wYXJ0aXRpb25fdmFsdWUgQVMgcGFydGl0aW9uCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKT1JERVIgQlkgcGFydGl0aW9uIEFTQw&run_query=true&tab=results) the list of all existing unique partitions of our example table by using the [virtual column](/docs/en/engines/table-engines#table_engines-virtual_columns) `_partition_value`:
```
SELECT DISTINCT _partition_value AS partition
FROM uk.uk_price_paid_simple_partitioned
ORDER BY partition ASC;


     ┌─partition──────┐
  1. │ ('1995-01-01') │
  2. │ ('1995-02-01') │
  3. │ ('1995-03-01') │
 ...
304. │ ('2021-04-01') │
305. │ ('2021-05-01') │
306. │ ('2021-06-01') │
     └────────────────┘
```

Alternatively, ClickHouse tracks all parts and partitions of all tables in the [system.parts](https://clickhouse.com/docs/en/operations/system-tables/parts) system table, and the following query [returns](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBwYXJ0aXRpb24sCiAgICBjb3VudCgpIEFTIHBhcnRzLAogICAgc3VtKHJvd3MpIEFTIHJvd3MKRlJPTSBzeXN0ZW0ucGFydHMKV0hFUkUgKGRhdGFiYXNlID0gJ3VrJykgQU5EIChgdGFibGVgID0gJ3VrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkJykgQU5EIGFjdGl2ZQpHUk9VUCBCWSBwYXJ0aXRpb24KT1JERVIgQlkgcGFydGl0aW9uIEFTQzs&run_query=true&tab=results) for our example table above the list of all partitions, plus the current number of active parts and the sum of rows in these parts per partition:
```
SELECT
    partition,
    count() AS parts,
    sum(rows) AS rows
FROM system.parts
WHERE (database = 'uk') AND (`table` = 'uk_price_paid_simple_partitioned') AND active
GROUP BY partition
ORDER BY partition ASC;


     ┌─partition──┬─parts─┬───rows─┐
  1. │ 1995-01-01 │     1 │  50473 │
  2. │ 1995-02-01 │     1 │  50840 │
  3. │ 1995-03-01 │     1 │  71276 │
 ...
304. │ 2021-04-01 │     3 │  23160 │
305. │ 2021-05-01 │     3 │  17607 │
306. │ 2021-06-01 │     3 │   5652 │
     └─partition──┴─parts─┴───rows─┘  
```



## What are table partitions used for?

### Data management

In ClickHouse, partitioning is primarily a data management feature. By organizing data logically based on a partition expression, each partition can be managed independently. For instance, the partitioning scheme in the example table above enables scenarios where only the last 12 months of data are retained in the main table by automatically removing older data using a [TTL rule](/docs/en/guides/developer/ttl) (see the added last row of the DDL statement):

```
CREATE TABLE uk.uk_price_paid_simple_partitioned
(
    date Date,
    town LowCardinality(String),
    street LowCardinality(String),
    price UInt32
)
ENGINE = MergeTree
PARTITION BY toStartOfMonth(date)
ORDER BY (town, street)
TTL date + INTERVAL 12 MONTH DELETE;
```
Since the table is partitioned by `toStartOfMonth(date)`, entire partitions (sets of [table parts](/docs/en/parts)) that meet the TTL condition will be dropped, making the cleanup operation more efficient, [without having to rewrite parts](/en/sql-reference/statements/alter#mutations).


Similarly, instead of deleting old data, it can be automatically and efficiently moved to a more cost-effective [storage tier](/en/integrations/s3#storage-tiers):
```
CREATE TABLE uk.uk_price_paid_simple_partitioned
(
    date Date,
    town LowCardinality(String),
    street LowCardinality(String),
    price UInt32
)
ENGINE = MergeTree
PARTITION BY toStartOfMonth(date)
ORDER BY (town, street)
TTL date + INTERVAL 12 MONTH TO VOLUME 'slow_but_cheap';
```
### Query optimization

Partitions can assist with query performance, but this depends heavily on the access patterns. If queries target only a few partitions (ideally one), performance can potentially improve. This is only typically useful if the partitioning key is not in the primary key and you are filtering by it, as shown in the example query below. 

```
SELECT MAX(price) AS highest_price
FROM uk_price_paid_simple_partitioned
WHERE date >= '2020-12-01' 
  AND date <= '2020-12-31'
  AND town = 'LONDON';

  
   ┌─highest_price─┐
1. │     296280000 │ -- 296.28 million
   └───────────────┘

1 row in set. Elapsed: 0.006 sec. Processed 8.19 thousand rows, 57.34 KB (1.36 million rows/s., 9.49 MB/s.)
Peak memory usage: 2.73 MiB.
```

The query runs over our example table from above and [calculates](https://sql.clickhouse.com/?query=U0VMRUNUIE1BWChwcmljZSkgQVMgaGlnaGVzdF9wcmljZQpGUk9NIHVrLnVrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkCldIRVJFIGRhdGUgPj0gJzIwMjAtMTItMDEnCiAgQU5EIGRhdGUgPD0gJzIwMjAtMTItMzEnCiAgQU5EIHRvd24gPSAnTE9ORE9OJzs&run_query=true&tab=results) the highest price of all sold properties in London in December 2020 by filtering on both a column (`date`) used in the table's partition key and on a column (`town`) used in the table's primary key (and `date` is not part of the primary key).

ClickHouse processes that query by applying a sequence of pruning techniques to avoid evaluating irrelevant data:

<img src={require('./images/partition-pruning.png').default} alt='PART MERGES' class='image' style={{width: '100%'}} />
<br/>

① **Partition pruning**: [MinMax indexes](/docs/en/partitions#what-are-table-partitions-in-clickhouse) are used to ignore whole partitions (sets of parts) that logically can't match the query's filter on columns used in the table's partition key.

② **Granule pruning**: For the remaining data parts after step ①, their [primary index](/docs/en/optimize/sparse-primary-indexes) is used to ignore all [granules](/docs/en/optimize/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing) (blocks of rows) that logically can't match the query's filter on columns used in the table's primary key.

We can observe these data pruning steps by [inspecting](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKV0hFUkUgZGF0ZSA-PSAnMjAyMC0xMi0wMScKICBBTkQgZGF0ZSA8PSAnMjAyMC0xMi0zMScKICBBTkQgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results) the physical query execution plan for our example query from above via an [EXPLAIN](/docs/en/sql-reference/statements/explain) clause :

```
EXPLAIN indexes = 1
SELECT MAX(price) AS highest_price
FROM uk_price_paid_simple_partitioned
WHERE date >= '2020-12-01' 
  AND date <= '2020-12-31'
  AND town = 'LONDON';


    ┌─explain──────────────────────────────────────────────────────────────────────────────────────────────────────┐
 1. │ Expression ((Project names + Projection))                                                                    │
 2. │   Aggregating                                                                                                │
 3. │     Expression (Before GROUP BY)                                                                             │
 4. │       Expression                                                                                             │
 5. │         ReadFromMergeTree (uk.uk_price_paid_simple_partitioned)                                              │
 6. │         Indexes:                                                                                             │
 7. │           MinMax                                                                                             │
 8. │             Keys:                                                                                            │
 9. │               date                                                                                           │
10. │             Condition: and((date in (-Inf, 18627]), (date in [18597, +Inf)))                                 │
11. │             Parts: 1/436                                                                                     │
12. │             Granules: 11/3257                                                                                │
13. │           Partition                                                                                          │
14. │             Keys:                                                                                            │
15. │               toStartOfMonth(date)                                                                           │
16. │             Condition: and((toStartOfMonth(date) in (-Inf, 18597]), (toStartOfMonth(date) in [18597, +Inf))) │
17. │             Parts: 1/1                                                                                       │
18. │             Granules: 11/11                                                                                  │
19. │           PrimaryKey                                                                                         │
20. │             Keys:                                                                                            │
21. │               town                                                                                           │
22. │             Condition: (town in ['LONDON', 'LONDON'])                                                        │
23. │             Parts: 1/1                                                                                       │
24. │             Granules: 1/11                                                                                   │
    └──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

The output above shows: 

① Partition pruning: Row 7 to 18 of the EXPLAIN output above show that ClickHouse first uses the `date` field's [MinMax index](/docs/en/partitions#what-are-table-partitions-in-clickhouse) to identify 11 out of 3257 existing [granules](/docs/en/optimize/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing) (blocks of rows) stored in 1 out of 436 existing active data parts that contain rows matching the query's `date` filter.

② Granule pruning: Row 19 to 24 of the EXPLAIN output above indicate that ClickHouse then uses the [primary index](/docs/en/optimize/sparse-primary-indexes) (created over the `town`-field) of the data part identified in step ① to  
further reduce the number of granules (that contain rows potentially also matching the query's `town` filter) from 11 to 1. This is also reflected in the ClickHouse-client output that we printed further above for the query run:
```
... Elapsed: 0.006 sec. Processed 8.19 thousand rows, 57.34 KB (1.36 million rows/s., 9.49 MB/s.)
Peak memory usage: 2.73 MiB.
```

Meaning that ClickHouse scanned and processed 1 granule (block of [8192](/docs/en/operations/settings/merge-tree-settings#index_granularity) rows) in 6 milliseconds for calculating the query result.

### Partitioning is primarily a data management feature

Be aware that querying across all partitions is typically slower than running the same query on a non-partitioned table.

With partitioning, the data is usually distributed across more data parts, which often leads to ClickHouse scanning and processing a larger volume of data.

We can demonstrate this by running the same query over both the [What are table parts](/docs/en/parts) example table (without partitioning enabled), and our current example table from above (with partitioning enabled). Both tables [contain](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICB0YWJsZSwKICAgIHN1bShyb3dzKSBBUyByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCBJTiBbJ3VrX3ByaWNlX3BhaWRfc2ltcGxlJywgJ3VrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkJ10pIEFORCBhY3RpdmUKR1JPVVAgQlkgdGFibGU7&run_query=true&tab=results) the same data and number of rows:
```
SELECT
    table,
    sum(rows) AS rows
FROM system.parts
WHERE (database = 'uk') AND (table IN ['uk_price_paid_simple', 'uk_price_paid_simple_partitioned']) AND active
GROUP BY table;

   ┌─table────────────────────────────┬─────rows─┐
1. │ uk_price_paid_simple             │ 25248433 │
2. │ uk_price_paid_simple_partitioned │ 25248433 │
   └──────────────────────────────────┴──────────┘
```

However, the table with partitions enabled, [has](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICB0YWJsZSwKICAgIGNvdW50KCkgQVMgcGFydHMKRlJPTSBzeXN0ZW0ucGFydHMKV0hFUkUgKGRhdGFiYXNlID0gJ3VrJykgQU5EIChgdGFibGVgIElOIFsndWtfcHJpY2VfcGFpZF9zaW1wbGUnLCAndWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQnXSkgQU5EIGFjdGl2ZQpHUk9VUCBCWSB0YWJsZTs&run_query=true&tab=results) more active [data parts](/docs/en/parts), because, as mentioned above, ClickHouse only [merges](/docs/en/parts) data parts within, but not across partitions: 
 
```
SELECT
    table,
    count() AS parts
FROM system.parts
WHERE (database = 'uk') AND (table IN ['uk_price_paid_simple', 'uk_price_paid_simple_partitioned']) AND active
GROUP BY table;


   ┌─table────────────────────────────┬─parts─┐
1. │ uk_price_paid_simple             │     1 │
2. │ uk_price_paid_simple_partitioned │   436 │
   └──────────────────────────────────┴───────┘
```
As shown further above, the partitioned table `uk_price_paid_simple_partitioned` has 306 partitions, and therefore at least 306 active data parts. Whereas for our non-partitioned table `uk_price_paid_simple` all [initial](/docs/en/parts) data parts could be merged into a single active part by background merges.


When we [check](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKV0hFUkUgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results) the physical query execution plan with an [EXPLAIN](/docs/en/sql-reference/statements/explain) clause for our example query from above without the partition filter running over the partitioned table, we can see in row 19 and 20 of the output below that ClickHouse identified 671 out of 3257 existing [granules](/docs/en/optimize/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing) (blocks of rows) spread over 431 out of 436 existing active data parts that potentially contain rows matching the query's filter, and therefore will be scanned and processed by the query engine: 
```
EXPLAIN indexes = 1
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple_partitioned
WHERE town = 'LONDON';


    ┌─explain─────────────────────────────────────────────────────────┐
 1. │ Expression ((Project names + Projection))                       │
 2. │   Aggregating                                                   │
 3. │     Expression (Before GROUP BY)                                │
 4. │       Expression                                                │
 5. │         ReadFromMergeTree (uk.uk_price_paid_simple_partitioned) │
 6. │         Indexes:                                                │
 7. │           MinMax                                                │
 8. │             Condition: true                                     │
 9. │             Parts: 436/436                                      │
10. │             Granules: 3257/3257                                 │
11. │           Partition                                             │
12. │             Condition: true                                     │
13. │             Parts: 436/436                                      │
14. │             Granules: 3257/3257                                 │
15. │           PrimaryKey                                            │
16. │             Keys:                                               │
17. │               town                                              │
18. │             Condition: (town in ['LONDON', 'LONDON'])           │
19. │             Parts: 431/436                                      │
20. │             Granules: 671/3257                                  │
    └─────────────────────────────────────────────────────────────────┘
```

The physical query execution plan for the same example query running over the table without partitions [shows](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGUKV0hFUkUgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results) in row 11 and 12 of the output below that ClickHouse identified 241 out of 3083 existing blocks of rows within the table's single active data part that potentially contain rows matching the query's filter: 

```
EXPLAIN indexes = 1
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple
WHERE town = 'LONDON';


    ┌─explain───────────────────────────────────────────────┐
 1. │ Expression ((Project names + Projection))             │
 2. │   Aggregating                                         │
 3. │     Expression (Before GROUP BY)                      │
 4. │       Expression                                      │
 5. │         ReadFromMergeTree (uk.uk_price_paid_simple)   │
 6. │         Indexes:                                      │
 7. │           PrimaryKey                                  │
 8. │             Keys:                                     │
 9. │               town                                    │
10. │             Condition: (town in ['LONDON', 'LONDON']) │
11. │             Parts: 1/1                                │
12. │             Granules: 241/3083                        │
    └───────────────────────────────────────────────────────┘
```

For [running](https://sql.clickhouse.com/?query=U0VMRUNUIE1BWChwcmljZSkgQVMgaGlnaGVzdF9wcmljZQpGUk9NIHVrLnVrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkCldIRVJFIHRvd24gPSAnTE9ORE9OJzs&run_query=true&tab=results) the query over the partitioned version of the table, ClickHouse scans and processes 671 blocks of rows (~ 5.5 million rows) in 90 milliseconds:
```
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple_partitioned
WHERE town = 'LONDON';


   ┌─highest_price─┐
1. │     594300000 │ -- 594.30 million
   └───────────────┘

1 row in set. Elapsed: 0.090 sec. Processed 5.48 million rows, 27.95 MB (60.66 million rows/s., 309.51 MB/s.)
Peak memory usage: 163.44 MiB.
```


Whereas for [running](https://sql.clickhouse.com/?query=U0VMRUNUIE1BWChwcmljZSkgQVMgaGlnaGVzdF9wcmljZQpGUk9NIHVrLnVrX3ByaWNlX3BhaWRfc2ltcGxlCldIRVJFIHRvd24gPSAnTE9ORE9OJzs&run_query=true&tab=results) the query over the non-partitioned table, ClickHouse scans and processes 241 blocks (~ 2 million rows) of rows in 12 milliseconds:
```
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple
WHERE town = 'LONDON';


   ┌─highest_price─┐
1. │     594300000 │ -- 594.30 million
   └───────────────┘

1 row in set. Elapsed: 0.012 sec. Processed 1.97 million rows, 9.87 MB (162.23 million rows/s., 811.17 MB/s.)
Peak memory usage: 62.02 MiB.
```
