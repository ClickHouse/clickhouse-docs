---
sidebar_position: 1
sidebar_label: Why is ClickHouse so Fast?
description: "It was designed to be fast. Query execution performance has always been a top priority during the development process, but other important characteristics like user-friendliness, scalability, and security were also considered so ClickHouse could become a real production system."
---

# Why is ClickHouse so fast? {#why-clickhouse-is-so-fast}

Many other factors contribute to a database's performance besides its data orientation.   
We will next explain in more detail what makes ClickHouse so fast, especially compared to other column-oriented databases.

From an architectural perspective, databases consist (at least) of a storage layer and a query processing layer. While the storage layer is responsible for saving, loading, and maintaining the table data, the query processing layer executes user queries. Compared to other databases, ClickHouse provides innovations in both layers that enable extremely fast inserts and Select queries.

## Storage Layer: Concurrent inserts are isolated from each other

In ClickHouse, each table consists of multiple “table parts”. A part is created whenever a user inserts data into the table (INSERT statement). A query is always executed against all table parts that exist at the time the query starts.

To avoid that too many parts accumulate, ClickHouse runs a merge operation in the background which continuously combines multiple (small) parts into a single bigger part. 

This approach has several advantages: On the one hand, individual inserts are “local” in the sense that they do not need to update global, i.e. per-table data structures. As a result, multiple simultaneous inserts need no mutual synchronization or synchronization with existing table data, and thus inserts can be performed almost at the speed of disk I/O.

## Storage Layer: Concurrent inserts and selects are isolated

On the other hand, merging parts is a background operation which is invisible to the user, i.e. does not affect concurrent SELECT queries. In fact, this architecture isolates insert and selects so effectively, that many other databases adopted it.

## Storage Layer: Merge-time computation

Unlike other databases, ClickHouse is also able to perform additional data transformations during the merge operation. Examples of this include:

- **Replacing merges** which retain only the most recent version of a row in the input parts and discard all other row versions. Replacing merges can be thought of as a merge-time cleanup operation.

- **Aggregating merges** which combine intermediate aggregation states in the input part to a new aggregation state. While this seems difficult to understand, it really actually only implements an incremental aggregation.

- **TTL (time-to-live) merges** compress, move, or delete rows based on certain time-based rules.

The point of these transformations is to shift work (computation) from the time user queries run to merge time. This is important for two reasons: 

On the one hand, user queries may become significantly faster, sometimes by 1000x or more, if they can leverage “transformed” data, e.g. pre-aggregated data. 

On the other hand, the majority of the runtime of merges is consumed by loading the input parts and saving the output part. The additional effort to transform the data during merge does usually not impact the runtime of merges too much. All of this magic is completely transparent and does not affect the result of queries (besides their performance).

## Storage Layer: Data pruning

In practice, many queries are repetitive, i.e., run unchanged or only with slight modifications (e.g. different parameter values) in periodic intervals. Running the same or similar queries again and again allows adding indexes or re-organize the data in a way that frequent queries can access it faster. This approach is also known as “data pruning” and ClickHouse provides three techniques for that:

1. [Primary key indexes](https://clickhouse.com/docs/en/optimize/sparse-primary-indexes) which define the sort order of the table data. A well-chosen primary key allows to evaluate filters (like the WHERE clauses in the above query) using fast binary searches instead of full-column scans. In more technical terms, the runtime of scans becomes logarithmic instead of linear in the data size.

2. [Table projections](https://clickhouse.com/docs/en/sql-reference/statements/alter/projection) as alternative, internal versions of a table, storing the same data but sorted by a different primary key. Projections can be useful when there is more than one frequent filter condition.

3. [Skipping indexes](https://clickhouse.com/docs/en/optimize/skipping-indexes) that embed additional data statistics into columns, e.g. the minimum and maximum column value, the set of unique values, etc. Skipping indexes are orthogonal to primary keys and table projections, and depending on the data distribution in the column, they can greatly speed up the evaluation of filters.

All three techniques aim to skip as many rows during full-column reads as possible because the fastest way to read data is to not read it at all.

## Storage Layer: Data compression 

Besides that, ClickHouse’s storage layer additionally (and optionally) compresses the raw table data using different codecs.

Column-stores are particularly well suited for such compression as values of the same type and data distribution are located together. 

Users can [specify](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema) that columns are compressed using various generic compression algorithms (like ZSTD) or specialized codecs, e.g. Gorilla and FPC for floating-point values, Delta and GCD for integer values, or even AES as an encrypting codec. 

Data compression not only reduces the storage size of the database tables, but in many cases, it also improves query performance as local disks and network I/O are often constrained by low throughput.

## State-of-the-art query processing layer

Finally, ClickHouse uses a vectorized query processing layer that parallelizes query execution as much as possible to utilize all resources for maximum speed and efficiency.

“Vectorization” means that query plan operators pass intermediate result rows in batches instead of single rows. This leads to better utilization of CPU caches and allows operators to apply SIMD instructions to process multiple values at once. In fact, many operators come in multiple versions \- one per SIMD instruction set generation. ClickHouse will automatically select the most recent and fastest version based on the capabilities of the hardware it runs on.

Modern systems have dozens of CPU cores. To utilize all cores, ClickHouse unfolds the query plan into multiple lanes, typically one per core. Each lane processes a disjoint range of the table data. That way, the performance of the database scales “vertically” with the number of available cores.

If a single node becomes too small to hold the table data, further nodes can be added to form a cluster. Tables can be split (“sharded”) and distributed across the nodes. ClickHouse will run queries on all nodes that store table data and thereby scale “horizontally” with the number of available nodes.

## Meticulous attention to detail 

> **“ClickHouse is a freak system - you guys have 20 versions of a hash table. You guys have all these amazing things where most systems will have one hash table** **…** **ClickHouse has this amazing performance because it has all these specialized components"** [Andy Pavlo, Database Professor at CMU](https://www.youtube.com/watch?v=Vy2t_wZx4Is&t=3579s)

What sets ClickHouse [apart](https://www.youtube.com/watch?v=CAS2otEoerM) is its meticulous attention to low-level optimization. Building a database that simply works is one thing, but engineering it to deliver speed across diverse query types, data structures, distributions, and index configurations is where the “[freak system](https://youtu.be/Vy2t_wZx4Is?si=K7MyzsBBxgmGcuGU&t=3579)” artistry shines.

  
**Hash Tables.** Let’s take a hash table as an example. Hash tables are central data structures used by joins and aggregations. As a programmer, one needs to consider these design decisions:

* The hash function to choose,  
* The collision resolution: [open addressing](https://en.wikipedia.org/wiki/Open_addressing) or [chaining](https://en.wikipedia.org/wiki/Hash_table#Separate_chaining),  
* The memory layout: one array for keys and values or separate arrays?  
* The fill factor: When and how to resize? How to move values during resize?  
* Deletions: Should the hash table allow evicting entries?

A standard hash table provided by a third-party library would functionally work, but it would not be fast. Great performance requires meticulous benchmarking and experimentation. 

The [hash table implementation in ClickHouse](https://clickhouse.com/blog/hash-tables-in-clickhouse-and-zero-cost-abstractions) chooses one of **30+ precompiled hash table variants based** on the specifics of the query and the data.

**Algorithms.** The same goes for algorithms. For example, in sorting, you might consider:

* What will be sorted: numbers, tuples, strings, or structures?  
* Is the data in RAM?  
* Is the sort required to be stable?  
* Should all data be sorted or will a partial sort suffice?

Algorithms that rely on data characteristics often perform better than their generic counterparts. If the data characteristics are not known in advance, the system can try various implementations and choose the one that works best at runtime. For an example, see the [article on how LZ4 decompression is implemented in ClickHouse](https://habr.com/en/company/yandex/blog/457612/).


## VLDB 2024 paper

In August 2024, we had our first research paper accepted and published at VLDB. 
VLDB in an international conference on very large databases, and is widely regarded as one of the leading conferences in the field of data management. 
Among the hundreds of submissions, VLDB generally has an acceptance rate of ~20%.

You can read a [PDF of the paper](https://www.vldb.org/pvldb/vol17/p3731-schulze.pdf), which gives a concise description of ClickHouse's most interesting architectural and system design components that make it so fast.

Alexey Milovidov, our CTO and the creator of ClickHouse, presented the paper (slides [here](https://raw.githubusercontent.com/ClickHouse/clickhouse-presentations/master/vldb_2024/VLDB_2024_presentation.pdf)), followed by a Q&A (that quickly ran out of time!). 
You can catch the recorded presentation here: 

<iframe width="768" height="432" src="https://www.youtube.com/embed/7QXKBKDOkJE?si=5uFerjqPSXQWqDkF" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
