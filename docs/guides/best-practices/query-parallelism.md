---
slug: /optimize/query-parallelism
sidebar_label: 'Query parallelism'
sidebar_position: 20
description: 'ClickHouse parallelizes query execution using processing lanes and the max_threads setting.'
title: 'How ClickHouse executes a query in parallel'
doc_type: 'guide'
keywords: ['parallel processing', 'query optimization', 'performance', 'threading', 'best practices']
---

import visual01 from '@site/static/images/guides/best-practices/query-parallelism_01.gif';
import visual02 from '@site/static/images/guides/best-practices/query-parallelism_02.gif';
import visual03 from '@site/static/images/guides/best-practices/query-parallelism_03.gif';
import visual04 from '@site/static/images/guides/best-practices/query-parallelism_04.gif';
import visual05 from '@site/static/images/guides/best-practices/query-parallelism_05.png';

import Image from '@theme/IdealImage';

# How ClickHouse executes a query in parallel

ClickHouse is [built for speed](/concepts/why-clickhouse-is-so-fast). It executes queries in a highly parallel fashion, using all available CPU cores, distributing data across processing lanes, and often pushing hardware close to its limits.
 
This guide walks through how query parallelism works in ClickHouse and how you can tune or monitor it to improve performance on large workloads.

We use an aggregation query on the [uk_price_paid_simple](/parts) dataset to illustrate key concepts.

## Step-by-step: How ClickHouse parallelizes an aggregation query {#step-by-step-how-clickHouse-parallelizes-an-aggregation-query}

When ClickHouse ① runs an aggregation query with a filter on the table's primary key, it ② loads the primary index into memory to ③ identify which granules need to be processed, and which can be safely skipped:

<Image img={visual01} size="md" alt="Index analysis"/>

### Distributing work across processing lanes {#distributing-work-across-processing-lanes}

The selected data is then [dynamically](#load-balancing-across-processing-lanes) distributed across `n` parallel [processing lanes](/academic_overview#4-2-multi-core-parallelization), which stream and process the data [block](/development/architecture#block) by block into the final result:

<Image img={visual02} size="md" alt="4 parallel processing lanes"/>

<br/><br/>
The number of `n` parallel processing lanes is controlled by the [max_threads](/operations/settings/settings#max_threads) setting, which by default matches the number of CPU cores available to ClickHouse on the server. In the example above, we assume `4` cores. 

On a machine with `8` cores, query processing throughput would roughly double (but memory usage would also increase accordingly), as more lanes process data in parallel:

<Image img={visual03} size="md" alt="8 parallel processing lanes"/>

<br/><br/>
Efficient lane distribution is key to maximizing CPU utilization and reducing total query time.

### Processing queries on sharded tables {#processing-queries-on-sharded-tables}

When table data is distributed across multiple servers as [shards](/shards), each server processes its shard in parallel. Within each server, the local data is handled using parallel processing lanes, just as described above:

<Image img={visual04} size="md" alt="Distributed lanes"/>

<br/><br/>
The server that initially receives the query collects all sub-results from the shards and combines them into the final global result.

Distributing query load across shards allows horizontal scaling of parallelism, especially for high-throughput environments.

:::note ClickHouse Cloud uses parallel replicas instead of shards
In ClickHouse Cloud, this same parallelism is achieved through [parallel replicas](https://clickhouse.com/docs/deployment-guides/parallel-replicas), which function similarly to shards in shared-nothing clusters. Each ClickHouse Cloud replica—a stateless compute node—processes a portion of the data in parallel and contributes to the final result, just like an independent shard would.
:::

## Monitoring query parallelism {#monitoring-query-parallelism}

Use these tools to verify that your query fully utilizes available CPU resources and to diagnose when it doesn't.

We're running this on a test server with 59 CPU cores, which allows ClickHouse to fully showcase its query parallelism.

To observe how the example query is executed, we can instruct the ClickHouse server to return all trace-level log entries during the aggregation query. For this demonstration, we removed the query's predicate—otherwise, only 3 granules would be processed, which isn't enough data for ClickHouse to make use of more than a few parallel processing lanes:
```sql runnable=false
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
SETTINGS send_logs_level='trace';
```

```txt
① <Debug> ...: 3609 marks to read from 3 ranges
② <Trace> ...: Spreading mark ranges among streams
② <Debug> ...: Reading approx. 29564928 rows with 59 streams
```

We can see that

* ① ClickHouse needs to read 3,609 granules (indicated as marks in the trace logs) across 3 data ranges.
* ② With 59 CPU cores, it distributes this work across 59 parallel processing streams—one per lane.

Alternatively, we can use the [EXPLAIN](/sql-reference/statements/explain#explain-pipeline) clause to inspect the [physical operator plan](/academic_overview#4-2-multi-core-parallelization)—also known as the "query pipeline"—for the aggregation query:
```sql runnable=false
EXPLAIN PIPELINE
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple;
```

```txt
    ┌─explain───────────────────────────────────────────────────────────────────────────┐
 1. │ (Expression)                                                                      │
 2. │ ExpressionTransform × 59                                                          │
 3. │   (Aggregating)                                                                   │
 4. │   Resize 59 → 59                                                                  │
 5. │     AggregatingTransform × 59                                                     │
 6. │       StrictResize 59 → 59                                                        │
 7. │         (Expression)                                                              │
 8. │         ExpressionTransform × 59                                                  │
 9. │           (ReadFromMergeTree)                                                     │
10. │           MergeTreeSelect(pool: PrefetchedReadPool, algorithm: Thread) × 59 0 → 1 │
    └───────────────────────────────────────────────────────────────────────────────────┘
```

Note: Read the operator plan above from bottom to top. Each line represents a stage in the physical execution plan, starting with reading data from storage at the bottom and ending with the final processing steps at the top. Operators marked with `× 59` are executed concurrently on non-overlapping data regions across 59 parallel processing lanes. This reflects the value of `max_threads` and illustrates how each stage of the query is parallelized across CPU cores.

ClickHouse's [embedded web UI](/interfaces/http) (available at the `/play` endpoint) can render the physical plan from above as a graphical visualization. In this example, we set `max_threads` to `4` to keep the visualization compact, showing just 4 parallel processing lanes:

<Image img={visual05} alt="Query pipeline"/>

Note: Read the visualization from left to right. Each row represents a parallel processing lane that streams data block by block, applying transformations such as filtering, aggregation, and final processing stages. In this example, you can see four parallel lanes corresponding to the `max_threads = 4` setting.

### Load balancing across processing lanes {#load-balancing-across-processing-lanes}

Note that the `Resize` operators in the physical plan above [repartition and redistribute](/academic_overview#4-2-multi-core-parallelization) data block streams across processing lanes to keep them evenly utilized. This rebalancing is especially important when data ranges vary in how many rows match the query predicates, otherwise, some lanes may become overloaded while others sit idle. By redistributing the work, faster lanes effectively help out slower ones, optimizing overall query runtime.

## Why max_threads isn't always respected {#why-max-threads-isnt-always-respected}

As mentioned above, the number of `n` parallel processing lanes is controlled by the `max_threads` setting, which by default matches the number of CPU cores available to ClickHouse on the server:
```sql runnable=false
SELECT getSetting('max_threads');
```

```txt
   ┌─getSetting('max_threads')─┐
1. │                        59 │
   └───────────────────────────┘
```

However, the `max_threads` value may be ignored depending on the amount of data selected for processing:
```sql runnable=false
EXPLAIN PIPELINE
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
WHERE town = 'LONDON';
```

```txt
...   
(ReadFromMergeTree)
MergeTreeSelect(pool: PrefetchedReadPool, algorithm: Thread) × 30
```

As shown in the operator plan extract above, even though `max_threads` is set to `59`, ClickHouse uses only **30** concurrent streams to scan the data.

Now let's run the query:
```sql runnable=false
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
WHERE town = 'LONDON';
```

```txt
   ┌─max(price)─┐
1. │  594300000 │ -- 594.30 million
   └────────────┘
   
1 row in set. Elapsed: 0.013 sec. Processed 2.31 million rows, 13.66 MB (173.12 million rows/s., 1.02 GB/s.)
Peak memory usage: 27.24 MiB.   
```

As shown in the output above, the query processed 2.31 million rows and read 13.66MB of data. This is because, during the index analysis phase, ClickHouse selected **282 granules** for processing, each containing 8,192 rows, totaling approximately 2.31 million rows:

```sql runnable=false
EXPLAIN indexes = 1
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
WHERE town = 'LONDON';
```

```txt
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
11. │             Parts: 3/3                                │
12. │             Granules: 282/3609                        │
    └───────────────────────────────────────────────────────┘  
```

Regardless of the configured `max_threads` value, ClickHouse only allocates additional parallel processing lanes when there's enough data to justify them. The "max" in `max_threads` refers to an upper limit, not a guaranteed number of threads used.

What "enough data" means is primarily determined by two settings, which define the minimum number of rows (163,840 by default) and the minimum number of bytes (2,097,152 by default) that each processing lane should handle:

For shared-nothing clusters:
* [merge_tree_min_rows_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read)
* [merge_tree_min_bytes_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read)

For clusters with shared storage (e.g. ClickHouse Cloud):
* [merge_tree_min_rows_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read_for_remote_filesystem)
* [merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem)

Additionally, there's a hard lower limit for read task size, controlled by:
* [Merge_tree_min_read_task_size](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_read_task_size) + [merge_tree_min_bytes_per_task_for_remote_reading](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_per_task_for_remote_reading)

:::warning Don't modify these settings
We don't recommend modifying these settings in production. They're shown here solely to illustrate why `max_threads` doesn't always determine the actual level of parallelism.
:::

For demonstration purposes, let's inspect the physical plan with these settings overridden to force maximum concurrency:
```sql runnable=false
EXPLAIN PIPELINE
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
WHERE town = 'LONDON'
SETTINGS
  max_threads = 59,
  merge_tree_min_read_task_size = 0,
  merge_tree_min_rows_for_concurrent_read_for_remote_filesystem = 0, 
  merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem = 0;
```

```txt
...   
(ReadFromMergeTree)
MergeTreeSelect(pool: PrefetchedReadPool, algorithm: Thread) × 59
```

Now ClickHouse uses 59 concurrent streams to scan the data, fully respecting the configured `max_threads`.

This demonstrates that for queries on small datasets, ClickHouse will intentionally limit concurrency. Use setting overrides only for testing—not in production—as they can lead to inefficient execution or resource contention.

## Key takeaways {#key-takeaways}

* ClickHouse parallelizes queries using processing lanes tied to `max_threads`.
* The actual number of lanes depends on the size of data selected for processing.
* Use `EXPLAIN PIPELINE` and trace logs to analyze lane usage.

## Where to find more information  {#where-to-find-more-information}

If you'd like to dive deeper into how ClickHouse executes queries in parallel and how it achieves high performance at scale, explore the following resources: 

* [Query Processing Layer – VLDB 2024 Paper (Web Edition)](/academic_overview#4-query-processing-layer) - A detailed breakdown of ClickHouse's internal execution model, including scheduling, pipelining, and operator design.

* [Partial aggregation states explained](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#-multi-core-parallelization) - A technical deep dive into how partial aggregation states enable efficient parallel execution across processing lanes.

* A video tutorial walking in detail through all ClickHouse query processing steps:
<iframe width="1024" height="576" src="https://www.youtube.com/embed/hP6G2Nlz_cA?si=Imd_i427J_kZOXHe" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
