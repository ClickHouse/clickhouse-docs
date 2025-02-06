---
slug: /en/parts
title: Table parts
description: What are data parts in ClickHouse
keywords: [part]
---

## What are table parts in ClickHouse?

<br/>

The data from each table in the ClickHouse [MergeTree engine family](/docs/en/engines/table-engines/mergetree-family) is organized on disk as a collection of immutable `data parts`. 

To illustrate this, we use [this](https://sql.clickhouse.com/?query=U0hPVyBDUkVBVEUgVEFCTEUgdWsudWtfcHJpY2VfcGFpZF9zaW1wbGU&run_query=true&tab=results) table (adapted from the [UK property prices dataset](/docs/en/getting-started/example-datasets/uk-price-paid)) tracking the date, town, street, and price for sold properties in the United Kingdom:


```
CREATE TABLE uk.uk_price_paid_simple
(
    date Date,
    town LowCardinality(String),
    street LowCardinality(String),
    price UInt32
)
ENGINE = MergeTree
ORDER BY (town, street);
```

You can [query this table](https://sql.clickhouse.com/?query=U0VMRUNUICogRlJPTSB1ay51a19wcmljZV9wYWlkX3NpbXBsZTs&run_query=true&tab=results) in our ClickHouse SQL Playground.

A data part is created whenever a set of rows is inserted into the table. The following diagram sketches this:

<img src={require('./images/part.png').default} alt='INSERT PROCESSING' class='image' style={{width: '100%'}} />
<br/>

When a ClickHouse server processes the example insert with 4 rows (e.g., via an [INSERT INTO statement](/docs/en/sql-reference/statements/insert-into)) sketched in the diagram above, it performs several steps:

① **Sorting**: The rows are sorted by the table’s sorting key `(town, street)`, and a [sparse primary index](/docs/en/optimize/sparse-primary-indexes) is generated for the sorted rows.

② **Splitting**: The sorted data is split into columns.

③ **Compression**: Each column is [compressed](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema).

④ **Writing to Disk**: The compressed columns are saved as binary column files within a new directory representing the insert’s data part. The sparse primary index is also compressed and stored in the same directory.

Depending on the table’s specific engine, additional transformations [may](/docs/en/operations/settings/settings) take place alongside sorting.

Data parts are self-contained, including all metadata needed to interpret their contents without requiring a central catalog. Beyond the sparse primary index, parts contain additional metadata, such as secondary [data skipping indexes](/docs/en/optimize/skipping-indexes), [column statistics](https://clickhouse.com/blog/clickhouse-release-23-11#column-statistics-for-prewhere), checksums, min-max indexes (if [partitioning](/docs/en/partitions) is used), and [more](https://github.com/ClickHouse/ClickHouse/blob/a065b11d591f22b5dd50cb6224fab2ca557b4989/src/Storages/MergeTree/MergeTreeData.h#L104).

## Part merges

To manage the number of parts per table, a [background merge](/docs/en/merges) job periodically combines smaller parts into larger ones until they reach a [configurable](/docs/en/operations/settings/merge-tree-settings#max-bytes-to-merge-at-max-space-in-pool) compressed size (typically ~150 GB). Merged parts are marked as inactive and deleted after a [configurable](/docs/en/operations/settings/merge-tree-settings#old-parts-lifetime) time interval. Over time, this process creates a hierarchical structure of merged parts, which is why it’s called a MergeTree table:

<img src={require('./images/merges.png').default} alt='PART MERGES' class='image' style={{width: '100%'}} />
<br/>

To minimize the number of initial parts and the overhead of merges, database clients are [encouraged](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance) to either insert tuples in bulk, e.g. 20,000 rows at once, or to use the [asynchronous insert mode](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse), in which ClickHouse buffers rows from multiple incoming INSERTs into the same table and creates a new part only after the buffer size exceeds a configurable threshold, or a timeout expires.

## Monitoring table parts

You can [query](https://sql.clickhouse.com/?query=U0VMRUNUIF9wYXJ0CkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGUKR1JPVVAgQlkgX3BhcnQKT1JERVIgQlkgX3BhcnQgQVNDOw&run_query=true&tab=results) the list of all currently existing active parts of our example table by using the [virtual column](/docs/en/engines/table-engines#table_engines-virtual_columns) `_part`:

```
SELECT _part
FROM uk.uk_price_paid_simple
GROUP BY _part
ORDER BY _part ASC;

   ┌─_part───────┐
1. │ all_0_5_1   │
2. │ all_12_17_1 │
3. │ all_18_23_1 │
4. │ all_6_11_1  │
   └─────────────┘
```
The query above retrieves the names of directories on disk, with each directory representing an active data part of the table. The components of these directory names have specific meanings, which are documented [here](https://github.com/ClickHouse/ClickHouse/blob/f90551824bb90ade2d8a1d8edd7b0a3c0a459617/src/Storages/MergeTree/MergeTreeData.h#L130) for those interested in exploring further.

Alternatively, ClickHouse tracks info for all parts of all tables in the [system.parts](https://clickhouse.com/docs/en/operations/system-tables/parts) system table, and the following query [returns](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBuYW1lLAogICAgbGV2ZWwsCiAgICByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCA9ICd1a19wcmljZV9wYWlkX3NpbXBsZScpIEFORCBhY3RpdmUKT1JERVIgQlkgbmFtZSBBU0M7&run_query=true&tab=results) for our example table above the list of all currently active parts, their merge level, and the number of rows stored in these parts:
```
SELECT
    name,
    level,
    rows
FROM system.parts
WHERE (database = 'uk') AND (`table` = 'uk_price_paid_simple') AND active
ORDER BY name ASC;


   ┌─name────────┬─level─┬────rows─┐
1. │ all_0_5_1   │     1 │ 6368414 │
2. │ all_12_17_1 │     1 │ 6442494 │
3. │ all_18_23_1 │     1 │ 5977762 │
4. │ all_6_11_1  │     1 │ 6459763 │
   └─────────────┴───────┴─────────┘
```
The merge level is incremented by one with each additional merge on the part. A level of 0 indicates this is a new part that has not been merged yet.