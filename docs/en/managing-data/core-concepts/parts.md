---
slug: /en/parts
title: Table parts
description: What are data parts in ClickHouse
keywords: [part]
---



## What are table parts in ClickHouse?

The data from each table in the ClickHouse [MergeTree engine family](https://clickhouse.com/docs/en/engines/table-engines/mergetree-family) is organized on disk as a collection of immutable `data parts`. 

To illustrate this, we use this table (adapted from the [UK property prices dataset](https://clickhouse.com/docs/en/getting-started/example-datasets/uk-price-paid)) tracking the date, town, street, and price for sold properties in the United Kingdom:


```
CREATE TABLE uk_price_paid
(
    date Date,
    town LowCardinality(String),
    street LowCardinality(String),
    price UInt32
)
ENGINE = MergeTree
ORDER BY (town, street);
```


A data part is created whenever a set of rows is inserted into the table. The following diagram sketches this:

<img src={require('./images/part.png').default} alt='INSERT PROCESSING' class='image' style={{width: '100%'}} />

When a ClickHouse server processes the example insert with 4 rows (e.g., via an [INSERT INTO statement](https://clickhouse.com/docs/en/sql-reference/statements/insert-into))  sketched in the diagram above, it performs several steps:

① **Sorting**: The rows are sorted by the table’s sorting key `(town, street)`, and a [sparse primary index](https://clickhouse.com/docs/en/optimize/sparse-primary-indexes) is generated for the sorted rows.

② **Splitting**: The sorted data is split into columns.

③ **Compression**: Each column is [compressed](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema).

④ **Writing to Disk**: The compressed columns are saved as binary column files within a new directory representing the insert’s data part. The sparse primary index is also compressed and stored in the same directory.

Depending on the table’s specific engine, additional transformations [may](https://clickhouse.com/docs/en/operations/settings/settings) take place alongside sorting.

Data parts are self-contained, including all metadata needed to interpret their contents without requiring a central catalog. Beyond the sparse primary index, parts contain additional metadata, such as secondary [data skipping indexes](https://clickhouse.com/docs/en/optimize/skipping-indexes), [column statistics](https://clickhouse.com/blog/clickhouse-release-23-11#column-statistics-for-prewhere), checksums, min-max indexes (if partitioning is used), and [more](https://github.com/ClickHouse/ClickHouse/blob/a065b11d591f22b5dd50cb6224fab2ca557b4989/src/Storages/MergeTree/MergeTreeData.h#L104).

To manage the number of parts per table, a background merge job periodically combines smaller parts into larger ones until they reach a [configurable](https://clickhouse.com/docs/en/operations/settings/merge-tree-settings#max-bytes-to-merge-at-max-space-in-pool) compressed size (typically ~150 GB). Merged parts are marked as inactive and deleted after a [configurable](https://clickhouse.com/docs/en/operations/settings/merge-tree-settings#old-parts-lifetime) time interval. Over time, this process creates a hierarchical structure of merged parts, which is why it’s called a MergeTree table:

<img src={require('./images/merges.png').default} alt='PART MERGES' class='image' style={{width: '100%'}} />


To minimize the number of initial parts and the overhead of merges, database clients are [encouraged](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance) to either insert tuples in bulk, e.g. 20,000 rows at once, or to use the [asynchronous insert mode](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse), in which ClickHouse buffers rows from multiple incoming INSERTs into the same table and creates a new part only after the buffer size exceeds a configurable threshold or a timeout expires.
