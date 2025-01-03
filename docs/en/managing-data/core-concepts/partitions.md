---
slug: /en/partitions
title: Table partitions
description: What are table partitions in ClickHouse
keywords: [partitions]
---

## What are table partitions in ClickHouse?

<br/>


Partitions group the [data parts](/docs/en/parts) of a table in the [MergeTree engine family](/docs/en/engines/table-engines/mergetree-family) into organized, logical units, which is a way of organizing data that is conceptually meaningful and aligned with specific criteria, such as time ranges, categories, or other key attributes. These logical units make data easier to manage, query, and optimize.


Partitioning can be enabled when a table is initially defined via the [PARTITION BY clause](/docs/en/engines/table-engines/mergetree-family/custom-partitioning-key). This clause can contain a SQL expression on any columns, the results of which will define which partition a row belongs to.

To illustrate this, we enhance the [What are table parts](/docs/en/parts) example table by adding a `PARTITION BY toStartOfMonth(date)` clause, which organizes the table`s data parts based on the months of property sales:


```
CREATE TABLE uk_price_paid
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

Whenever a set of rows is inserted into the table, instead of creating (at [least](/docs/en/operations/settings/settings#max_insert_block_size)) one single data part containing all the inserted rows (as described [here](/docs/en/parts)), ClickHouse creates one new data part for each unique partition key value among the inserted rows:

<img src={require('./images/partitions.png').default} alt='INSERT PROCESSING' class='image' style={{width: '100%'}} />
<br/>

The ClickHouse server first splits the rows from the example insert with 4 rows sketched in the diagram above by their partition key value `toStartOfMonth(date)`. 
Then, for each identified partition, the rows are processed as [usual](/docs/en/parts) by performing several sequential steps (① Sorting, ② Splitting into columns, ③ Compression, ④ Writing to Disk). 

Note that with partitioning enabled, ClickHouse automatically creates [MinMax indexes](https://github.com/ClickHouse/ClickHouse/blob/dacc8ebb0dac5bbfce5a7541e7fc70f26f7d5065/src/Storages/MergeTree/IMergeTreeDataPart.h#L341) for each data part. These are simply files for each table column used in the partition key expression, containing the minimum and maximum values of that column within the data part.


Further note that with partitioning enabled, ClickHouse only [merges](/docs/en/parts) data parts within, but not across partitions. We sketch that for our example table from above:

<img src={require('./images/merges_with_partitions.png').default} alt='PART MERGES' class='image' style={{width: '50%'}} />
<br/>

As sketched in the diagram above, parts belonging to different partitions are never merged. If a partition key with high cardinality is chosen, then parts spread across thousands of partitions will never be merge candidates - exceeding preconfigured limits and causing the dreaded `Too many parts` error. Addressing this problem is simple: choose a sensible partition key with [cardinality under 1000..10000](https://github.com/ClickHouse/ClickHouse-beta/blob/c35751b5f86edaaf6fa144182b955678e56bf30a/src/Storages/MergeTree/MergeTreeDataWriter.cpp#L79).


## What are table partitions used for?

### Data management

In ClickHouse, partitioning is primarily a data management feature. By organizing data logically based on a partition expression, each partition can be managed independently. For instance, the partitioning scheme in the example table above enables scenarios where only the last 12 months of data are retained in the main table by automatically removing older data using a [TTL rule](https://clickhouse.com/blog/using-ttl-to-manage-data-lifecycles-in-clickhouse) (see the added last row of the DDL statement):

```
CREATE TABLE uk_price_paid
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
CREATE TABLE uk_price_paid
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

Partitions can assist with query performance, but this depends heavily on the access patterns. If queries target only a few partitions (ideally one), performance can potentially improve. This is only typically useful if the partitioning key is not in the primary key and you are filtering by it, as shown in the example query below. The query runs over our example table from above and calculates the highest price of all sold properties in London in December 2024 by filtering on both a column (`date`) used in the table's partition key and on a column (`town`) used in the table's primary key (and `date` is not part of the primary key):

<img src={require('./images/partition-pruning.png').default} alt='PART MERGES' class='image' style={{width: '70%'}} />
<br/>

ClickHouse processes that query by applying a sequence of pruning techniques to avoid evaluating irrelevant data:

① **Partition pruning**: MinMax indexes are used to ignore whole partitions (sets of parts) that logically can't match the query's filter on columns used in the table's partition key.

② **Granule pruning**: For the remaining data parts after step ①, the [primary indexes](/docs/en/optimize/sparse-primary-indexes) are used to ignore all [granules](/docs/en/optimize/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing) (blocks of rows) that logically can't match the query's filter on columns used in the table's primary key.







