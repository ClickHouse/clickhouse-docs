---
slug: /best-practices/minimize-optimize-joins
sidebar_position: 10
sidebar_label: 'Minimize and Optimize JOINs'
title: 'Minimize and optimize JOINs'
description: 'Page describing best practices for JOINs'
keywords: ['JOIN', 'Parallel Hash JOIN']
show_related_blogs: true
doc_type: explanation
---

import Image from '@theme/IdealImage';
import joins from '@site/static/images/bestpractices/joins-speed-memory.png';

ClickHouse supports a wide variety of JOIN types and algorithms, and JOIN performance has improved significantly in recent releases. However, JOINs are inherently more expensive than querying from a single, denormalized table. Denormalization shifts computational work from query time to insert or pre-processing time, which often results in significantly lower latency at runtime. For real-time or latency-sensitive analytical queries, **denormalization is strongly recommended**.

In general, denormalize when:

- Tables change infrequently or when batch refreshes are acceptable.
- Relationships are not many-to-many or not excessively high in cardinality.
- Only a limited subset of the columns will be queried, i.e. certain columns can be excluded from denormalization.
- You have the capability to shift processing out of ClickHouse into upstream systems like Flink, where real-time enrichment or flattening can be managed.

Not all data needs to be denormalized - focus on the attributes that are frequently queried. Also consider [materialized views](/best-practices/use-materialized-views) to incrementally compute aggregates instead of duplicating entire sub-tables. When schema updates are rare and latency is critical, denormalization offers the best performance trade-off.

For a full guide on denormalizing data in ClickHouse see [here](/data-modeling/denormalization).

## When JOINs are required {#when-joins-are-required}

When JOINs are required, ensure you're using **at least version 24.12 and preferably the latest version**, as JOIN performance continues to improve with each new release. As of ClickHouse 24.12, the query planner now automatically places the smaller table on the right side of the join for optimal performance - a task that previously had to be done manually. Even more enhancements are coming soon, including more aggressive filter pushdown and automatic re-ordering of multiple joins.

Follow these best practices to improve JOIN performance:

* **Avoid cartesian products**: If a value on the left-hand side matches multiple values on the right-hand side, the JOIN will return multiple rows - the so-called cartesian product. If your use case doesn't need all matches from the right-hand side but just any single match, you can use `ANY` JOINs (e.g. `LEFT ANY JOIN`). They are faster and use less memory than regular JOINs.
* **Reduce the sizes of JOINed tables**: The runtime and memory consumption of JOINs grows proportionally with the sizes of the left and right tables. To reduce the amount of processed data by the JOIN, add additional filter conditions in the `WHERE` or `JOIN ON` clauses of the query. ClickHouse pushes filter conditions as deep as possible down in the query plan, usually before JOINs. If the filters are not pushed down automatically (for any reason), rewrite one side of the JOIN as a sub-query to force pushdown.
* **Use direct JOINs via dictionaries if appropriate**: Standard JOINs in ClickHouse are executed in two phases: a build phase which iterates the right-hand side to build a hash table, followed by a probe phase which iterates the left-hand side to find matching join partners via hash table lookups. If the right-hand side is a [dictionary](/dictionary) or another table engine with key-value characteristics (e.g. [EmbeddedRocksDB](/engines/table-engines/integrations/embedded-rocksdb) or the [Join table engine](/engines/table-engines/special/join)), then ClickHouse can use the "direct" join algorithm, which effectively removes the need to build a hash table, speeding up query processing. This works for `INNER` and `LEFT OUTER` JOINs and is preferred for real-time analytical workloads.
* **Utilize the table sorting for JOINs**: Each table in ClickHouse is sorted by the table's primary key columns. It is possible to exploit the table sorting by so-called sort-merge JOINs algorithms like `full_sorting_merge` and `partial_merge`. Unlike standard JOIN algorithms based on hash tables (see below, `parallel_hash`, `hash`, `grace_hash`), sort-merge JOIN algorithms first sort and then merge both tables. If the query JOINs both tables by their respective primary key columns, then sort-merge has an optimization which omits the sort step, saving processing time and overhead.
* **Avoid disk-spilling JOINs**: Intermediate states of JOINs (e.g. hash tables) can become so big that they no longer fit into main memory. In this situation, ClickHouse will return an out-of-memory error by default. Some join algorithms (see below), for example [`grace_hash`](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2), [`partial_merge`](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3) and [`full_sorting_merge`](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3), are able to spill intermediate states to disk and continue query execution. These join algorithms should nevertheless be used with care as disk access can significantly slow down join processing. We instead recommend optimizing the JOIN query in other ways to reduce the size of intermediate states.
* **Default values as no-match markers in outer JOINs**: Left/right/full outer joins include all values from the left/right/both tables. If no join partner is found in the other table for some value, ClickHouse replaces the join partner by a special marker. The SQL standard mandates that databases use NULL as such a marker. In ClickHouse, this requires wrapping the result column in Nullable, creating an additional memory and performance overhead. As an alternative, you can configure the setting `join_use_nulls = 0` and use the default value of the result column data type as marker.

:::note Use dictionaries carefully
When using dictionaries for JOINs in ClickHouse, it's important to understand that dictionaries, by design, do not allow duplicate keys. During data loading, any duplicate keys are silently deduplicated—only the last loaded value for a given key is retained. This behavior makes dictionaries ideal for one-to-one or many-to-one relationships where only the latest or authoritative value is needed. However, using a dictionary for a one-to-many or many-to-many relationship (e.g. joining roles to actors where an actor can have multiple roles) will result in silent data loss, as all but one of the matching rows will be discarded. As a result, dictionaries are not suitable for scenarios requiring full relational fidelity across multiple matches.
:::

## Choosing the correct JOIN Algorithm {#choosing-the-right-join-algorithm}

ClickHouse supports several JOIN algorithms that trade off between speed and memory:

* **Parallel Hash JOIN (default):** Fast for small-to-medium right-hand tables that fit in memory.
* **Direct JOIN:** Ideal when using dictionaries (or other table engines with key-value characteristics) with `INNER` or `LEFT ANY JOIN`  - the fastest method for point lookups as it eliminates the need to build a hash table.
* **Full Sorting Merge JOIN:** Efficient when both tables are sorted on the join key.
* **Partial Merge JOIN:** Minimizes memory but is slower—best for joining large tables with limited memory.
* **Grace Hash JOIN:** Flexible and memory-tunable, good for large datasets with adjustable performance characteristics.

<Image img={joins} size="md" alt="Joins - speed vs memory"/>

:::note
Each algorithm has varying support for JOIN types. A full list of supported join types for each algorithm can be found [here](/guides/joining-tables#choosing-a-join-algorithm).
:::

You can let ClickHouse choose the best algorithm by setting `join_algorithm = 'auto'` (the default), or explicitly control it based on your workload. If you need to select a join algorithm to optimize for performance or memory overhead, we recommend [this guide](/guides/joining-tables#choosing-a-join-algorithm).

For optimal performance:

* Keep JOINs to a minimum in high-performance workloads.
* Avoid more than 3–4 joins per query.
* Benchmark different algorithms on real data - performance varies based on JOIN key distribution and data size.

For more on JOIN optimization strategies, JOIN algorithms, and how to tune them, refer to the[ ClickHouse documentation](/guides/joining-tables) and this [blog series](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1).
