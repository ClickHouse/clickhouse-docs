---
slug: /en/optimize/query-optimization
sidebar_label: Query optimization
title: Guide for Query optimization
description: A simple guide for query optimization that describe common path to improve query performance
---

# A simple guide for query optimization

This section aims to illustrate through common scenarios how to use different performance and optimization techniques, such as [analyzer](/docs/en/operations/analyzer), [query profiling](/docs/en/operations/optimizing-performance/sampling-query-profiler) or [avoid Nullable Columns](/docs/en/optimize/avoid-nullable-columns), in order to improve your ClickHouse query performances. 

## Understand query performance

The best moment to think about performance optimization is when you’re setting up your [data schema](/docs/en/data-modeling/schema-design) before ingesting data into ClickHouse for the first time. 

But let’s be honest; it is difficult to predict how much your data will grow or what types of queries will be executed. 

If you have an existing deployment with a few queries that you want to improve, the first step is understanding how those queries perform and why some execute in a few milliseconds while others take longer.

ClickHouse has a rich set of tools to help you understand how your query is getting executed and the resources consumed to perform the execution. 

In this section, we will look at those tools and how to use them. 

## General considerations

To understand query performance, let’s look at what happens in ClickHouse when a query is executed. 

The following part is deliberately simplified and takes some shortcuts; the idea here is not to drown you with details but to get you up to speed with the basic concepts. For more information you can read about [query analyzer](/docs/en/operations/analyzer). 

From a very high-level standpoint, when ClickHouse executes a query, the following happens: 

  - **Query parsing and analysis**

The query is parsed and analyzed, and a generic query execution plan is created. 

  - **Query optimization**

The query execution plan is optimized, unnecessary data is pruned, and a query pipeline is built from the query plan. 

  - **Query pipeline execution**

The data is read and processed in parallel. This is the stage where ClickHouse actually executes the query operations such as filtering, aggregations, and sorting. 

  - **Final processing**

The results are merged, sorted, and formatted into a final result before being sent to the client.

In reality, many [optimizations](/docs/en/concepts/why-clickhouse-is-so-fast) are taking place, and we will discuss them a bit more in this guide, but for now, those main concepts give us a good understanding of what is happening behind the scenes when ClickHouse executes a query. 

With this high-level understanding, let’s examine the tooling ClickHouse provides and how we can use it to track the metrics that affect query performance. 

## Dataset 

We'll use a real example to illustrate how we approach query performances. 

Let's use the NYC Taxi dataset, which contains taxi ride data in NYC. First, we start by ingesting the NYC taxi dataset with no optimization.

Below is the command to create the table and insert data from an S3 bucket. Note that we infer the schema from the data voluntarily, which is not optimized.

```sql
-- Create table with inferred schema
CREATE TABLE trips_small_inferred
ORDER BY () EMPTY
AS SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/clickhouse-academy/nyc_taxi_2009-2010.parquet');

-- Insert data into table with inferred schema
INSERT INTO trips_small_inferred
SELECT * 
FROM s3Cluster
('default','https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/clickhouse-academy/nyc_taxi_2009-2010.parquet');
```

Let's have a look to the table schema automatically inferred from the data. 

```sql
--- Display inferred table schema
SHOW CREATE TABLE trips_small_inferred

Query id: d97361fd-c050-478e-b831-369469f0784d

CREATE TABLE nyc_taxi.trips_small_inferred
(
    `vendor_id` Nullable(String),
    `pickup_datetime` Nullable(DateTime64(6, 'UTC')),
    `dropoff_datetime` Nullable(DateTime64(6, 'UTC')),
    `passenger_count` Nullable(Int64),
    `trip_distance` Nullable(Float64),
    `ratecode_id` Nullable(String),
    `pickup_location_id` Nullable(String),
    `dropoff_location_id` Nullable(String),
    `payment_type` Nullable(Int64),
    `fare_amount` Nullable(Float64),
    `extra` Nullable(Float64),
    `mta_tax` Nullable(Float64),
    `tip_amount` Nullable(Float64),
    `tolls_amount` Nullable(Float64),
    `total_amount` Nullable(Float64)
)
ORDER BY tuple() 
```

## Spot the slow queries

### Query logs 

By default, ClickHouse collects and logs information about each executed query in the [query logs](/docs/en/operations/system-tables/query_log). This data is stored in the table `system.query_log`. 

For each executed query, ClickHouse logs statistics such as query execution time, number of rows read, and resource usage, such as CPU, memory usage, or filesystem cache hits. 

Therefore, the query log is a good place to start when investigating slow queries. You can easily spot the queries that take a long time to execute and display the resource usage information for each one. 

Let’s find the top five long-running queries on our NYC taxi dataset. 

```sql
-- Find top 5 long running queries from nyc_taxi database in the last 1 hour
SELECT
    type,
    event_time,
    query_duration_ms,
    query,
    read_rows,
    tables
FROM clusterAllReplicas(default, system.query_log)
WHERE has(databases, 'nyc_taxi') AND (event_time >= (now() - toIntervalMinute(60))) AND type='QueryFinish'
ORDER BY query_duration_ms DESC
LIMIT 5
FORMAT VERTICAL

Query id: e3d48c9f-32bb-49a4-8303-080f59ed1835

Row 1:
──────
type:              QueryFinish
event_time:        2024-11-27 11:12:36
query_duration_ms: 2967
query:             WITH
  dateDiff('s', pickup_datetime, dropoff_datetime) as trip_time,
  trip_distance / trip_time * 3600 AS speed_mph
SELECT
  quantiles(0.5, 0.75, 0.9, 0.99)(trip_distance)
FROM
  nyc_taxi.trips_small_inferred
WHERE
  speed_mph > 30
FORMAT JSON
read_rows:         329044175
tables:            ['nyc_taxi.trips_small_inferred']

Row 2:
──────
type:              QueryFinish
event_time:        2024-11-27 11:11:33
query_duration_ms: 2026
query:             SELECT 
    payment_type,
    COUNT() AS trip_count,
    formatReadableQuantity(SUM(trip_distance)) AS total_distance,
    AVG(total_amount) AS total_amount_avg,
    AVG(tip_amount) AS tip_amount_avg
FROM 
    nyc_taxi.trips_small_inferred
WHERE 
    pickup_datetime >= '2009-01-01' AND pickup_datetime < '2009-04-01'
GROUP BY 
    payment_type
ORDER BY 
    trip_count DESC;

read_rows:         329044175
tables:            ['nyc_taxi.trips_small_inferred']

Row 3:
──────
type:              QueryFinish
event_time:        2024-11-27 11:12:17
query_duration_ms: 1860
query:             SELECT
  avg(dateDiff('s', pickup_datetime, dropoff_datetime))
FROM nyc_taxi.trips_small_inferred
WHERE passenger_count = 1 or passenger_count = 2
FORMAT JSON
read_rows:         329044175
tables:            ['nyc_taxi.trips_small_inferred']

Row 4:
──────
type:              QueryFinish
event_time:        2024-11-27 11:12:31
query_duration_ms: 690
query:             SELECT avg(total_amount) FROM nyc_taxi.trips_small_inferred WHERE trip_distance > 5
FORMAT JSON
read_rows:         329044175
tables:            ['nyc_taxi.trips_small_inferred']

Row 5:
──────
type:              QueryFinish
event_time:        2024-11-27 11:12:44
query_duration_ms: 634
query:             SELECT
vendor_id,
avg(total_amount),
avg(trip_distance),
FROM
nyc_taxi.trips_small_inferred
GROUP BY vendor_id
ORDER BY 1 DESC
FORMAT JSON
read_rows:         329044175
tables:            ['nyc_taxi.trips_small_inferred']
```

The field `query_duration_ms` indicates how long it took for that particular query to execute. Looking at the results from the query logs, we can see that the first query is taking 2967ms to run, which could be improved. 

You might also want to know which queries are stressing the system by examining the query that consumes the most memory or CPU. 

```sql
-- Top queries by memory usage 
SELECT
    type,
    event_time,
    query_id,
    formatReadableSize(memory_usage) AS memory,
    ProfileEvents.Values[indexOf(ProfileEvents.Names, 'UserTimeMicroseconds')] AS userCPU,
    ProfileEvents.Values[indexOf(ProfileEvents.Names, 'SystemTimeMicroseconds')] AS systemCPU,
    (ProfileEvents['CachedReadBufferReadFromCacheMicroseconds']) / 1000000 AS FromCacheSeconds,
    (ProfileEvents['CachedReadBufferReadFromSourceMicroseconds']) / 1000000 AS FromSourceSeconds,
    normalized_query_hash
FROM clusterAllReplicas(default, system.query_log)
WHERE has(databases, 'nyc_taxi') AND (type='QueryFinish') AND ((event_time >= (now() - toIntervalDay(2))) AND (event_time <= now())) AND (user NOT ILIKE '%internal%')
ORDER BY memory_usage DESC
LIMIT 30
```

Let’s isolate the long-running queries we found and rerun them a few times to understand the response time. 

At this point, it is essential to turn off the filesystem cache by setting the `enable_filesystem_cache` setting to 0 to improve reproducibility. 


```sql
-- Disable filesystem cache
set enable_filesystem_cache = 0;

-- Run query 1
WITH
  dateDiff('s', pickup_datetime, dropoff_datetime) as trip_time,
  trip_distance / trip_time * 3600 AS speed_mph
SELECT
  quantiles(0.5, 0.75, 0.9, 0.99)(trip_distance)
FROM
  nyc_taxi.trips_small_inferred
WHERE
  speed_mph > 30
FORMAT JSON

----
1 row in set. Elapsed: 1.699 sec. Processed 329.04 million rows, 8.88 GB (193.72 million rows/s., 5.23 GB/s.)
Peak memory usage: 440.24 MiB.

-- Run query 2
SELECT 
    payment_type,
    COUNT() AS trip_count,
    formatReadableQuantity(SUM(trip_distance)) AS total_distance,
    AVG(total_amount) AS total_amount_avg,
    AVG(tip_amount) AS tip_amount_avg
FROM 
    nyc_taxi.trips_small_inferred
WHERE 
    pickup_datetime >= '2009-01-01' AND pickup_datetime < '2009-04-01'
GROUP BY 
    payment_type
ORDER BY 
    trip_count DESC;

--- 
4 rows in set. Elapsed: 1.419 sec. Processed 329.04 million rows, 5.72 GB (231.86 million rows/s., 4.03 GB/s.)
Peak memory usage: 546.75 MiB.

-- Run query 3
SELECT
  avg(dateDiff('s', pickup_datetime, dropoff_datetime))
FROM nyc_taxi.trips_small_inferred
WHERE passenger_count = 1 or passenger_count = 2
FORMAT JSON

---
1 row in set. Elapsed: 1.414 sec. Processed 329.04 million rows, 8.88 GB (232.63 million rows/s., 6.28 GB/s.)
Peak memory usage: 451.53 MiB.
```

Summarize in the table for easy reading. 

| Name    | Elapsed   | Rows processed | Peak memory |
| ------- | --------- | -------------- | ----------- |
| Query 1 | 1.699 sec | 329.04 million | 440.24 MiB  |
| Query 2 | 1.419 sec | 329.04 million | 546.75 MiB  |
| Query 3 | 1.414 sec | 329.04 million | 451.53 MiB  |

Let's understand a bit better what the queries achieve. 

-   Query 1 calculates the distance distribution in rides with an average speed of over 30 miles per hour.
-   Query 2 finds the number and average cost of rides per week. 
-   Query 3 calculates the average time of each trip in the dataset.

None of these queries are doing very complex processing, except the first query that calculates the trip time on the fly every time the query executes. However, each of these queries takes more than one second to execute, which, in the ClickHouse world, is a very long time. We can also note the memory usage of these queries; more or less 400 Mb for each query is quite a lot of memory. Also, each query appears to read the same number of rows (i.e., 329.04 million). Let's quickly confirm how many rows are in this table.

```sql
-- Count number of rows in table 
SELECT count()
FROM nyc_taxi.trips_small_inferred

Query id: 733372c5-deaf-4719-94e3-261540933b23

   ┌───count()─┐
1. │ 329044175 │ -- 329.04 million
   └───────────┘
```

The table contains 329.04 million rows, therefore each query is doing a full scan of the table. 

### Explain statement

Now that we have some long-running queries, let's understand how they are executed. For this, ClickHouse supports the [EXPLAIN statement command](/docs/en/sql-reference/statements/explain). It is a very useful tool that provides a very detailed view of all the query execution stages without actually running the query. While it can be overwhelming to look at for a non-ClickHouse expert, it remains an essential tool for gaining insight into how your query is executed.

The documentation provides a detailed [guide](/docs/en/guides/developer/understanding-query-execution-with-the-analyzer) on what the EXPLAIN statement is and how to use it to analyze your query execution. Rather than repeating what is in this guide, let's focus on a few commands that will help us find bottlenecks in query execution performance. 

**Explain indexes = 1**

Let's start with EXPLAIN indexes = 1 to inspect the query plan. The query plan is a tree showing how the query will be executed. There, you can see in which order the clauses from the query will be executed. The query plan returned by the EXPLAIN statement can be read from bottom to top.

Let's try using the first of our long-running queries.

```sql
EXPLAIN indexes = 1
WITH
    dateDiff('s', pickup_datetime, dropoff_datetime) AS trip_time,
    (trip_distance / trip_time) * 3600 AS speed_mph
SELECT quantiles(0.5, 0.75, 0.9, 0.99)(trip_distance)
FROM nyc_taxi.trips_small_inferred
WHERE speed_mph > 30

Query id: f35c412a-edda-4089-914b-fa1622d69868

   ┌─explain─────────────────────────────────────────────┐
1. │ Expression ((Projection + Before ORDER BY))         │
2. │   Aggregating                                       │
3. │     Expression (Before GROUP BY)                    │
4. │       Filter (WHERE)                                │
5. │         ReadFromMergeTree (nyc_taxi.trips_small_inferred) │
   └─────────────────────────────────────────────────────┘
```

The output is straightforward. The query begins by reading data from the `nyc_taxi.trips_small_inferred` table. Then, the WHERE clause is applied to filter rows based on computed values. The filtered data is prepared for aggregation, and the quantiles are computed. Finally, the result is sorted and outputted. 

Here, we can note that no primary keys are used, which makes sense as we didn't define any when we created the table. As a result, ClickHouse is doing a full scan of the table for the query. 

**Explain Pipeline**

EXPLAIN Pipeline shows the concrete execution strategy for the query. There, you can see how ClickHouse actually executed the generic query plan we looked at previously.

```sql
EXPLAIN PIPELINE
WITH
    dateDiff('s', pickup_datetime, dropoff_datetime) AS trip_time,
    (trip_distance / trip_time) * 3600 AS speed_mph
SELECT quantiles(0.5, 0.75, 0.9, 0.99)(trip_distance)
FROM nyc_taxi.trips_small_inferred
WHERE speed_mph > 30

Query id: c7e11e7b-d970-4e35-936c-ecfc24e3b879

    ┌─explain─────────────────────────────────────────────────────────────────────────────┐
 1. │ (Expression)                                                                        │
 2. │ ExpressionTransform × 59                                                            │
 3. │   (Aggregating)                                                                     │
 4. │   Resize 59 → 59                                                                    │
 5. │     AggregatingTransform × 59                                                       │
 6. │       StrictResize 59 → 59                                                          │
 7. │         (Expression)                                                                │
 8. │         ExpressionTransform × 59                                                    │
 9. │           (Filter)                                                                  │
10. │           FilterTransform × 59                                                      │
11. │             (ReadFromMergeTree)                                                     │
12. │             MergeTreeSelect(pool: PrefetchedReadPool, algorithm: Thread) × 59 0 → 1 │
```

Here, we can note the number of threads used to execute the query: 59 threads, which indicates a high parallelization. This speeds up the query, which would take longer to execute on a smaller machine. The number of threads running in parallel can explain the high volume of memory the query uses. 

Ideally, you would investigate all your slow queries the same way to identify unnecessary complex query plans and understand the number of rows read by each query and the resources consumed. 

## Methodology

It can be difficult to identify problematic queries on a production deployment, as there are probably a large number of queries being executed at any given time on your ClickHouse deployment. 

If you know which user, database, or tables are having issues, you can use the fields `user`, `tables`, or `databases` from the `system.query_logs` to narrow down the search. 

Once you identify the queries you want to optimize, you can start working on them to optimize. One common mistake developers make at this stage is changing multiple things simultaneously, running ad-hoc experiments, and usually ending up with mixed results, but, more importantly, missing a good understanding of what made the query faster. 

Query optimization requires structure. I’m not talking about advanced benchmarking, but having a simple process in place to understand how your changes affect query performance can go a long way. 

Start by identifying your slow queries from query logs, then investigate potential improvements in isolation. When testing the query, make sure you disable the filesystem cache. 

> ClickHouse leverages [caching](/docs/en/operations/caches) to speed up query performance at different stages. This is good for query performance, but during troubleshooting, it could hide potential I/O bottlenecks or poor table schema. For this reason, I suggest turning off the filesystem cache during testing. Make sure to have it enabled in production setup.

Once you have identified potential optimizations, it is recommended that you implement them one by one to better track how they affect performance. Below is a diagram describing the general approach.

<img src={require('./images/query_optimization_diagram_1.png').default} class="image" />


_Finally, be cautious of outliers; it’s pretty common that a query might run slowly, either because a user tried an ad-hoc expensive query or the system was under stress for another reason. You can group by the field normalized_query_hash to identify expensive queries that are being executed regularly. Those are probably the ones you want to investigate._

## Basic optimization 

Now that we have our framework to test, we can start optimizing.

The best place to start is to look at how the data is stored. As for any database, the less data we read, the faster the query will be executed. 

Depending on how you ingested your data, you might have leveraged ClickHouse [capabilities](/docs/en/interfaces/schema-inference) to infer the table schema based on the ingested data. While this is very practical to get started, if you want to optimize your query performance, you’ll need to review the data schema to best fit your use case. 

### Nullable

As described in the [best practices documentation](/docs/en/cloud/bestpractices/avoid-nullable-columns), avoid nullable columns wherever possible. It is tempting to use them often, as they make the data ingestion mechanism more flexible, but they negatively affect performance as an additional column has to be processed every time.

Running an SQL query that counts the rows with a NULL value can easily reveal the columns in your tables that actually need a Nullable value.

```sql
-- Find non-null values columns 
SELECT
    countIf(vendor_id IS NULL) AS vendor_id_nulls,
    countIf(pickup_datetime IS NULL) AS pickup_datetime_nulls,
    countIf(dropoff_datetime IS NULL) AS dropoff_datetime_nulls,
    countIf(passenger_count IS NULL) AS passenger_count_nulls,
    countIf(trip_distance IS NULL) AS trip_distance_nulls,
    countIf(fare_amount IS NULL) AS fare_amount_nulls,
    countIf(mta_tax IS NULL) AS mta_tax_nulls,
    countIf(tip_amount IS NULL) AS tip_amount_nulls,
    countIf(tolls_amount IS NULL) AS tolls_amount_nulls,
    countIf(total_amount IS NULL) AS total_amount_nulls,
    countIf(payment_type IS NULL) AS payment_type_nulls,
    countIf(pickup_location_id IS NULL) AS pickup_location_id_nulls,
    countIf(dropoff_location_id IS NULL) AS dropoff_location_id_nulls
FROM trips_small_inferred
FORMAT VERTICAL

Query id: 4a70fc5b-2501-41c8-813c-45ce241d85ae

Row 1:
──────
vendor_id_nulls:           0
pickup_datetime_nulls:     0
dropoff_datetime_nulls:    0
passenger_count_nulls:     0
trip_distance_nulls:       0
fare_amount_nulls:         0
mta_tax_nulls:             137946731
tip_amount_nulls:          0
tolls_amount_nulls:        0
total_amount_nulls:        0
payment_type_nulls:        69305
pickup_location_id_nulls:  0
dropoff_location_id_nulls: 0
```

We have only two columns with null values: `mta_tax` and `payment_type`. The rest of the fields should not be using a `Nullable` column.

### Low cardinality 

An easy optimization to apply to Strings is to make best use of the LowCardinality data type. As described in the low cardinality [documentation](/docs/en/sql-reference/data-types/lowcardinality), ClickHouse applies dictionary coding to LowCardinality-columns, which significantly increases query performance. 

An easy rule of thumb for determining which columns are good candidates for LowCardinality is that any column with less than 10,000 unique values is a perfect candidate.

You can use the following SQL query to find columns with a low number of unique values. 

```sql
-- Identify low cardinality columns
SELECT
    uniq(ratecode_id),
    uniq(pickup_location_id),
    uniq(dropoff_location_id),
    uniq(vendor_id)
FROM trips_small_inferred
FORMAT VERTICAL

Query id: d502c6a1-c9bc-4415-9d86-5de74dd6d932

Row 1:
──────
uniq(ratecode_id):         6
uniq(pickup_location_id):  260
uniq(dropoff_location_id): 260
uniq(vendor_id):           3
```

With a low cardinality, those four columns, `ratecode_id`, `pickup_location_id`, `dropoff_location_id`, and `vendor_id`, are good candidates for the LowCardinality field type.

### Optimize data type 

Clickhouse supports a large number of data types. Make sure to pick the smallest possible data type that fits your use case to optimize performance and reduce your data storage space on disk. 

For numbers, you can check the min/max value in your dataset to check if the current precision value matches the reality of your dataset. 

```sql
-- Find min/max values for the payment_type field
SELECT
    min(payment_type),max(payment_type),
    min(passenger_count), max(passenger_count)
FROM trips_small_inferred

Query id: 4306a8e1-2a9c-4b06-97b4-4d902d2233eb

   ┌─min(payment_type)─┬─max(payment_type)─┐
1. │                 1 │                 4 │
   └───────────────────┴───────────────────┘
```

For dates, you should pick a precision that matches your dataset and is best suited to answering the queries you’re planning to run. 

### Apply the optimizations

Let’s create a new table to use the optimized schema and re-ingest the data.  

```sql
-- Create table with optimized data 
CREATE TABLE trips_small_no_pk
(
    `vendor_id` LowCardinality(String),
    `pickup_datetime` DateTime,
    `dropoff_datetime` DateTime,
    `passenger_count` UInt8,
    `trip_distance` Float32,
    `ratecode_id` LowCardinality(String),
    `pickup_location_id` LowCardinality(String),
    `dropoff_location_id` LowCardinality(String),
    `payment_type` Nullable(UInt8),
    `fare_amount` Decimal32(2),
    `extra` Decimal32(2),
    `mta_tax` Nullable(Decimal32(2)),
    `tip_amount` Decimal32(2),
    `tolls_amount` Decimal32(2),
    `total_amount` Decimal32(2)
)
ORDER BY tuple();

-- Insert the data 
INSERT INTO trips_small_no_pk SELECT * FROM trips_small_inferred
```

We run the queries again using the new table to check for improvement. 

| Name    | Run 1 - Elapsed | Elapsed   | Rows processed | Peak memory |
| ------- | --------------- | --------- | -------------- | ----------- |
| Query 1 | 1.699 sec       | 1.353 sec | 329.04 million | 337.12 MiB  |
| Query 2 | 1.419 sec       | 1.171 sec | 329.04 million | 531.09 MiB  |
| Query 3 | 1.414 sec       | 1.188 sec | 329.04 million | 265.05 MiB  |

We notice some improvements in both query time and memory usage. Thanks to the optimization in the data schema, we reduce the total volume of data that represents our data, leading to improved memory consumption and reduced processing time. 

Let's check the size of the tables to see the difference. 

```sql
SELECT
    `table`,
    formatReadableSize(sum(data_compressed_bytes) AS size) AS compressed,
    formatReadableSize(sum(data_uncompressed_bytes) AS usize) AS uncompressed,
    sum(rows) AS rows
FROM system.parts
WHERE (active = 1) AND ((`table` = 'trips_small_no_pk') OR (`table` = 'trips_small_inferred'))
GROUP BY
    database,
    `table`
ORDER BY size DESC

Query id: 72b5eb1c-ff33-4fdb-9d29-dd076ac6f532

   ┌─table────────────────┬─compressed─┬─uncompressed─┬──────rows─┐
1. │ trips_small_inferred │ 7.38 GiB   │ 37.41 GiB    │ 329044175 │
2. │ trips_small_no_pk    │ 4.89 GiB   │ 15.31 GiB    │ 329044175 │
   └──────────────────────┴────────────┴──────────────┴───────────┘
```

The new table is considerably smaller than the previous one. We see a reduction of about 34% in disk space for the table (7.38 GiB vs 4.89 GiB).

## The importance of primary keys 

Primary keys in ClickHouse work differently than in most traditional database systems. In those systems, primary keys enforce uniqueness and data integrity. Any attempt to insert duplicate primary key values is rejected, and a B-tree or hash-based index is usually created for fast lookup. 

In ClickHouse, the primary key's [objective](/docs/en/optimize/sparse-primary-indexes#a-table-with-a-primary-key) is different; it does not enforce uniqueness or help with data integrity. Instead, it is designed to optimize query performance. The primary key defines the order in which the data is stored on disk and is implemented as a sparse index that stores pointers to the first row of each granule.

> Granules in ClickHouse are the smallest units of data read during query execution. They contain up to a fixed number of rows, determined by index_granularity, with a default value of 8192 rows. Granules are stored contiguously and sorted by the primary key. 

Selecting a good set of primary keys is important for performance, and it's actually common to store the same data in different tables and use different sets of primary keys to speed up a specific set of queries. 

Other options supported by ClickHouse, such as Projection or Materialized view, allow you to use a different set of primary keys on the same data. The second part of this blog series will cover this in more detail. 

### Choose primary keys

Choosing the correct set of primary keys is a complex topic, and it might require trade-offs and experiments to find the best combination. 

For now, we're going to follow these simple practices: 

-   Use fields that are used to filter in most queries
-   Choose columns with lower cardinality first 
-   Consider a time-based component in your primary key, as filtering by time on a timestamp dataset is pretty common. 

In our case, we will experiment with the following primary keys: `passenger_count`, `pickup_datetime`, and `dropoff_datetime`. 

The cardinality for passenger_count is small (24 unique values) and used in our slow queries. We also add timestamp fields (`pickup_datetime` and `dropoff_datetime`) as they can be filtered often.

Create a new table with the primary keys and re-ingest the data.

```sql
CREATE TABLE trips_small_pk
(
    `vendor_id` UInt8,
    `pickup_datetime` DateTime,
    `dropoff_datetime` DateTime,
    `passenger_count` UInt8,
    `trip_distance` Float32,
    `ratecode_id` LowCardinality(String),
    `pickup_location_id` UInt16,
    `dropoff_location_id` UInt16,
    `payment_type` Nullable(UInt8),
    `fare_amount` Decimal32(2),
    `extra` Decimal32(2),
    `mta_tax` Nullable(Decimal32(2)),
    `tip_amount` Decimal32(2),
    `tolls_amount` Decimal32(2),
    `total_amount` Decimal32(2)
)
PRIMARY KEY (passenger_count, pickup_datetime, dropoff_datetime);

-- Insert the data 
INSERT INTO trips_small_pk SELECT * FROM trips_small_inferred
```

We then rerun our queries. We compile the results from the three experiments to see the improvements in elapsed time, rows processed, and memory consumption. 

<table>
  <thead>
    <tr>
      <th colspan="4">Query 1</th>
    </tr>
    <tr>
      <th></th>
      <th>Run 1</th>
      <th>Run 2</th>
      <th>Run 3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Elapsed</td>
      <td>1.699 sec</td>
      <td>1.353 sec</td>
      <td>0.765 sec</td>
    </tr>
    <tr>
      <td>Rows processed</td>
      <td>329.04 million</td>
      <td>329.04 million</td>
      <td>329.04 million</td>
    </tr>
    <tr>
      <td>Peak memory</td>
      <td>440.24 MiB</td>
      <td>337.12 MiB</td>
      <td>444.19 MiB</td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th colspan="4">Query 2</th>
    </tr>
    <tr>
      <th></th>
      <th>Run 1</th>
      <th>Run 2</th>
      <th>Run 3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Elapsed</td>
      <td>1.419 sec</td>
      <td>1.171 sec</td>
      <td>0.248 sec</td>
    </tr>
    <tr>
      <td>Rows processed</td>
      <td>329.04 million</td>
      <td>329.04 million</td>
      <td>41.46 million</td>
    </tr>
    <tr>
      <td>Peak memory</td>
      <td>546.75 MiB</td>
      <td>531.09 MiB</td>
      <td>173.50 MiB</td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th colspan="4">Query 3</th>
    </tr>
    <tr>
      <th></th>
      <th>Run 1</th>
      <th>Run 2</th>
      <th>Run 3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Elapsed</td>
      <td>1.414 sec</td>
      <td>1.188 sec</td>
      <td>0.431 sec</td>
    </tr>
    <tr>
      <td>Rows processed</td>
      <td>329.04 million</td>
      <td>329.04 million</td>
      <td>276.99 million</td>
    </tr>
    <tr>
      <td>Peak memory</td>
      <td>451.53 MiB</td>
      <td>265.05 MiB</td>
      <td>197.38 MiB</td>
    </tr>
  </tbody>
</table>

We can see significant improvement across the board in execution time and memory used. 

Query 2 benefits most from the primary key. Let’s have a look at how the query plan generated is different from before. 

```sql
EXPLAIN indexes = 1
SELECT
    payment_type,
    COUNT() AS trip_count,
    formatReadableQuantity(SUM(trip_distance)) AS total_distance,
    AVG(total_amount) AS total_amount_avg,
    AVG(tip_amount) AS tip_amount_avg
FROM nyc_taxi.trips_small_pk
WHERE (pickup_datetime >= '2009-01-01') AND (pickup_datetime < '2009-04-01')
GROUP BY payment_type
ORDER BY trip_count DESC

Query id: 30116a77-ba86-4e9f-a9a2-a01670ad2e15

    ┌─explain──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 1. │ Expression ((Projection + Before ORDER BY [lifted up part]))                                                     │
 2. │   Sorting (Sorting for ORDER BY)                                                                                 │
 3. │     Expression (Before ORDER BY)                                                                                 │
 4. │       Aggregating                                                                                                │
 5. │         Expression (Before GROUP BY)                                                                             │
 6. │           Expression                                                                                             │
 7. │             ReadFromMergeTree (nyc_taxi.trips_small_pk)                                                          │
 8. │             Indexes:                                                                                             │
 9. │               PrimaryKey                                                                                         │
10. │                 Keys:                                                                                            │
11. │                   pickup_datetime                                                                                │
12. │                 Condition: and((pickup_datetime in (-Inf, 1238543999]), (pickup_datetime in [1230768000, +Inf))) │
13. │                 Parts: 9/9                                                                                       │
14. │                 Granules: 5061/40167                                                                             │
    └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Thanks to the primary key, only a subset of the table granules has been selected. This alone greatly improves the query performance since ClickHouse has to process significantly less data.

## Next steps

Hopefully this guide gets a good understanding on how to investigate slow queries with ClickHouse and how to make them faster. To explore more on this topic, you can read more about [query analyzer](/docs/en/operations/analyzer) and [profiling](/docs/en/operations/optimizing-performance/sampling-query-profiler) to understand better how exactly ClickHouse is executing your query. 

As you get more familiar with ClickHouse specificities, I would recommend to read about [partitioning keys](/docs/en/optimize/partitioning-key) and [data skipping indexes](/docs/en/optimize/skipping-indexes) to learn about more advanced techniques you can use to accelerate your queries. 
