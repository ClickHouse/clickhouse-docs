---
slug: /en/merges
title: Part merges
description: What are part merges in ClickHouse
keywords: [merges]
---

## What are part merges in ClickHouse?

<br/>

ClickHouse [is fast](/docs/en/concepts/why-clickhouse-is-so-fast) not just for queries but also for inserts, thanks to its [storage layer](https://www.vldb.org/pvldb/vol17/p3731-schulze.pdf), which operates similarly to [LSM trees](https://en.wikipedia.org/wiki/Log-structured_merge-tree):

① Inserts (into tables from the [MergeTree engine](https://clickhouse.com/docs/en/engines/table-engines/mergetree-family) family) create sorted, immutable [data parts](/docs/en/parts).

② All data processing is offloaded to **background part merges**.

This makes data writes lightweight and [highly efficient](/docs/en/concepts/why-clickhouse-is-so-fast#storage-layer-concurrent-inserts-are-isolated-from-each-other).

### Part merge example

To control the number of parts per table and implement ② above, ClickHouse continuously merges smaller parts into larger ones in the background until they reach a compressed size of approximately [~150 GiB](/docs/en/operations/settings/merge-tree-settings#max-bytes-to-merge-at-max-space-in-pool).

The following diagram sketches this background merge process:

<img src={require('./images/merges_01.png').default} alt='PART MERGES' class='image' style={{width: '60%'}} />

<br/>

The `merge level` of a part is incremented by one with each additional merge. A level of `0` means the part is new and has not been merged yet. Parts that were merged into larger parts are marked as [inactive](/docs/en/operations/system-tables/parts) and finally deleted after a [configurable](/docs/en/operations/settings/merge-tree-settings#old-parts-lifetime) time (8 minutes by default). Over time, this creates a **tree** of merged parts. Hence the name [merge tree](/docs/en/engines/table-engines/mergetree-family) table.

In the [What are table parts](/docs/en/parts) example, we showed that ClickHouse tracks all table parts in the [system.parts](/docs/en/operations/system-tables/parts) system table. We used the following query to retrieve the merge level and the number of stored rows for the example table:
```
SELECT
    name,
    level,
    rows
FROM system.parts
WHERE (database = 'uk') AND (`table` = 'uk_price_paid_simple') AND active
ORDER BY name ASC;
```

The previously documented query result shows that the example table had four active parts, each created from a single merge: 
```
   ┌─name────────┬─level─┬────rows─┐
1. │ all_0_5_1   │     1 │ 6368414 │
2. │ all_12_17_1 │     1 │ 6442494 │
3. │ all_18_23_1 │     1 │ 5977762 │
4. │ all_6_11_1  │     1 │ 6459763 │
   └─────────────┴───────┴─────────┘
```

[Running](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBuYW1lLAogICAgbGV2ZWwsCiAgICByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCA9ICd1a19wcmljZV9wYWlkX3NpbXBsZScpIEFORCBhY3RpdmUKT1JERVIgQlkgbmFtZSBBU0M7&run_query=true&tab=results) the query now shows that the four parts have since merged into a single final part: 

```
   ┌─name───────┬─level─┬─────rows─┐
1. │ all_0_23_2 │     2 │ 25248433 │
   └────────────┴───────┴──────────┘
```

### Concurrent part merges


A single ClickHouse server utilizes several background [merge threads](/docs/en/operations/server-configuration-parameters/settings#background_pool_size) to execute concurrent part merges:

<img src={require('./images/merges_02.png').default} alt='PART MERGES' class='image' style={{width: '60%'}} />

<br/>

Each merge thread executes a loop: 

① Decide which parts to merge next, and load these parts into memory.

② Merge the parts in memory into a larger parts.

③ Write the merged block into a new part on disk.

Go to ①

Note that increasing the number of CPU cores and the size of RAM increases the background merge throughput.

### Memory optimized merging

ClickHouse does not necessarily load all parts to be merged into memory at once, as sketched in the [previous example](/docs/en/merges#concurrent-part-merges). Based on several [factors](https://github.com/ClickHouse/clickhouse-private/blob/68008d83e6c3e8487bbbb7d672d35082f80f9453/src/Storages/MergeTree/MergeTreeSettings.cpp#L208), to reduce memory consumption (for the sacrifice of merge speed), so-called [vertical merging](https://github.com/ClickHouse/clickhouse-private/blob/68008d83e6c3e8487bbbb7d672d35082f80f9453/src/Storages/MergeTree/MergeTreeSettings.cpp#L207) loads and merges parts by chunks of blocks instead of in one go. 


### Merge mechanics

The diagram below illustrates how a single [background merge thread](/docs/en/merges#concurrent-part-merges) in ClickHouse merges parts (by default, without [vertical merging](/docs/en/merges#memory-optimized-merging)):

<img src={require('./images/merges_03.png').default} alt='PART MERGES' class='image' style={{width: '60%'}} />

<br/>

The part merging is performed in several steps:

 **① Decompression & Loading**: The [compressed binary column files](/docs/en/parts#what-are-table-parts-in-clickhouse) from the parts to be merged are decompressed and loaded into memory.

**② Merging**: The data is merged into larger column files.

**③ Indexing**: A new [sparse primary index](/docs/en/optimize/sparse-primary-indexes) is generated for the merged column files.

**④ Compression & Storage**: The new column files and index are [compressed](/docs/en/sql-reference/statements/create/table#column_compression_codec) and saved in a new [directory](/docs/en/parts#what-are-table-parts-in-clickhouse)directory representing the merged data part.

The mechanics of step ② depend on the specific [MergeTree engine](/docs/en/engines/table-engines/mergetree-family) used, as different engines handle merging differently. For example, rows may be aggregated or replaced if outdated. As mentioned earlier, this approach **offloads all data processing to background merges**, enabling **super-fast inserts** by keeping write operations lightweight and efficient.

Next, we will briefly outline the merge mechanics of specific engines in the MergeTree family.


### Standard merges

The diagram below illustrates how parts in a standard [MergeTree](/docs/en/engines/table-engines/mergetree-family/mergetree) table are merged:

<img src={require('./images/merges_04.png').default} alt='PART MERGES' class='image' style={{width: '60%'}} />

<br/>

The DDL statement in the diagram above creates a `MergeTree` table with a sorting key `(town, street)`, [meaning](/docs/en/parts#what-are-table-parts-in-clickhouse) data on disk is sorted by these columns, and a sparse primary index is generated accordingly.

The decompressed, pre-sorted table columns are merged while maintaining the global sorting order defined by the table’s sorting key (and a new sparse primary index is created based on the merged data).



### Replacing merges

Part merges in a [ReplacingMergeTree](/docs/en/engines/table-engines/mergetree-family/replacingmergetree) table work similarly to [standard merges](/docs/en/merges#standard-merges), but only the most recent version of each row is retained, with older versions being discarded:

<img src={require('./images/merges_05.png').default} alt='PART MERGES' class='image' style={{width: '60%'}} />

The DDL statement in the diagram above creates a `ReplacingMergeTree` table with a sorting key `(town, street, id)`, meaning data on disk is sorted by these columns, with a sparse primary index generated accordingly.

Merging works similarly to a `MergeTree` table, combining decompressed, pre-sorted columns while preserving the global sorting order.

However, the `ReplacingMergeTree` removes duplicate rows with the same sorting key, keeping only the most recent row based on the creation timestamp of its containing part.

<br/>

### Summing merges

Numeric data is automatically summarized during merges of parts from a [SummingMergTree](/docs/en/engines/table-engines/mergetree-family/summingmergetree) table:

<img src={require('./images/merges_06.png').default} alt='PART MERGES' class='image' style={{width: '60%'}} />

<br/>

The DDL statement in the diagram above defines a `SummingMergTree` table with `town` as the sorting key, meaning that data on disk is sorted by this column and a sparse primary index is created accordingly.

During part merges, ClickHouse replaces all rows with the same sorting key with a single row, summing the values of numeric columns.

### Aggregating merges

The `SummingMergeTree` table example from above is a specialized variant of the [AggregatingMergeTree](/docs/en/engines/table-engines/mergetree-family/aggregatingmergetree) table, allowing [automatic incremental data transformation](https://www.youtube.com/watch?v=QDAJTKZT8y4) by applying any of [90+](https://clickhouse.com/docs/en/sql-reference/aggregate-functions/reference) aggregation functions during part merges:

<img src={require('./images/merges_07.png').default} alt='PART MERGES' class='image' style={{width: '60%'}} />

<br/>

The DDL statement in the diagram above creates an `AggregatingMergeTree` table with `town` as the sorting key, ensuring data is ordered by this column on disk and a corresponding sparse primary index is generated.

During part merges, ClickHouse replaces all rows with the same sorting key with a single row storing [partial aggregation states](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#-multi-core-parallelization). These states ensure accurate results through incremental background merges.