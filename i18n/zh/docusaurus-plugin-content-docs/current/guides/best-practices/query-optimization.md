---
'slug': '/optimize/query-optimization'
'sidebar_label': '查询优化'
'title': '查询优化指南'
'description': '一个简单的查询优化指南，描述提高查询性能的常见方法'
---

import queryOptimizationDiagram1 from '@site/static/images/guides/best-practices/query_optimization_diagram_1.png';
import Image from '@theme/IdealImage';


# 查询优化的简单指南

本节旨在通过常见场景来说明如何使用不同的性能和优化技术，如 [analyzer](/operations/analyzer)、[查询分析](/operations/optimizing-performance/sampling-query-profiler) 或 [避免使用 Nullable 列](/optimize/avoid-nullable-columns)，来提高 ClickHouse 查询的性能。

## 了解查询性能 {#understand-query-performance}

考虑性能优化的最佳时机是当你在将数据首次导入 ClickHouse 之前设置 [数据模式](/data-modeling/schema-design) 的时候。

但说实话；很难预测你的数据将增长多少或将执行什么类型的查询。

如果你有一个现有的部署，想要改进其中的一些查询，第一步是理解这些查询的执行情况，以及为什么某些查询在几毫秒内执行而其他查询则需要更长时间。

ClickHouse 提供了一整套工具来帮助你理解查询是如何被执行的，以及执行过程中消耗了哪些资源。

在本节中，我们将探讨这些工具以及如何使用它们。

## 一般考虑事项 {#general-considerations}

要理解查询性能，我们需要了解 ClickHouse 在执行查询时发生了什么。

以下部分是经过简化的，采取了一些捷径；这里的目的是不是让你淹没于细节中，而是让你迅速了解基本概念。如需更多信息，可以阅读 [查询分析器](/operations/analyzer)。

从一个非常高层的角度来看，当 ClickHouse 执行查询时，会发生以下事情：

  - **查询解析与分析**

查询被解析和分析，并创建一个通用的查询执行计划。

  - **查询优化**

查询执行计划被优化，不需要的数据被剪枝，并从查询计划构建出一个查询管道。

  - **查询管道执行**

数据被并行读取和处理。在此阶段，ClickHouse 实际上执行查询操作，如过滤、聚合和排序。

  - **最终处理**

结果被合并、排序，并格式化为最终结果，然后发送给客户端。

实际上，许多 [优化](/concepts/why-clickhouse-is-so-fast) 正在进行中，我们将在本指南中详细讨论，但目前，这些主要概念给我们提供了一个良好的理解，了解在 ClickHouse 执行查询时发生了什么。

通过这种高层次的理解，让我们审视 ClickHouse 提供的工具及其如何用于追踪影响查询性能的指标。

## 数据集 {#dataset}

我们将使用一个真实的例子来说明我们如何接近查询性能。

让我们使用 NYC Taxi 数据集，其中包含纽约市的出租车行程数据。首先，我们从未优化的状态开始导入 NYC 出租车数据集。

以下是创建表和从 S3 存储桶插入数据的命令。请注意，我们自愿从数据中推断模式，这并没有经过优化。

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

让我们看看从数据中自动推断出的表模式。

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

## 找出慢查询 {#spot-the-slow-queries}

### 查询日志 {#query-logs}

默认情况下，ClickHouse 会收集和记录关于每个执行查询的信息，在 [查询日志](/operations/system-tables/query_log) 中。这些数据存储在表 `system.query_log` 中。

对于每个执行的查询，ClickHouse 会记录统计信息，如查询执行时间、读取的行数，以及资源使用情况（如 CPU、内存使用或文件系统缓存命中）。

因此，查询日志是调查慢查询的好地方。你可以轻松找到执行时间较长的查询，并显示每个查询的资源使用信息。

让我们找出我们 NYC 出租车数据集中前五个运行时间较长的查询。

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

字段 `query_duration_ms` 指示该特定查询的执行时间。根据来自查询日志的结果，我们可以看到第一个查询的运行时间为 2967ms，这可以得到改进。

你可能还想知道哪些查询给系统带来了压力，可以通过检查消耗最多内存或 CPU 的查询来了解。

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

让我们隔离这些长时间运行的查询，重新运行几次以了解响应时间。

此时，关闭文件系统缓存是至关重要的，办法是将 `enable_filesystem_cache` 设置为 0，以提高可重复性。

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

将其汇总在一个表中，以便于阅读。

| 名称    | 耗时      | 处理的行数     | 峰值内存     |
| ------- | --------- | -------------- | ----------- |
| 查询 1  | 1.699 秒  | 3.2904 亿      | 440.24 MiB  |
| 查询 2  | 1.419 秒  | 3.2904 亿      | 546.75 MiB  |
| 查询 3  | 1.414 秒  | 3.2904 亿      | 451.53 MiB  |

让我们更好地理解查询所实现的效果。

-   查询 1 计算平均时速超过 30 英里每小时的行程的距离分布。
-   查询 2 查找每周的行程数量和平均费用。
-   查询 3 计算数据集中每次行程的平均时间。

这些查询都没有进行复杂的处理，除了第一个查询每次执行时动态计算行程时间。但是，这些查询的执行时间超过了一秒，在 ClickHouse 的世界里，这是一个非常长的时间。我们还可以注意到这些查询的内存使用；每个查询差不多 400 MB 的内存相当可观。此外，每个查询读取的行数似乎都是相同的（即 3.2904 亿）。让我们迅速确认一下这个表有多少行。

```sql
-- Count number of rows in table
SELECT count()
FROM nyc_taxi.trips_small_inferred

Query id: 733372c5-deaf-4719-94e3-261540933b23

   ┌───count()─┐
1. │ 329044175 │ -- 329.04 million
   └───────────┘
```

该表包含 3.2904 亿行，因此每个查询都是对表的全表扫描。

### 解释语句 {#explain-statement}

现在我们有了一些长时间运行的查询，让我们理解它们是如何执行的。为此，ClickHouse 支持 [EXPLAIN 语句命令](/sql-reference/statements/explain)。它是一个非常有用的工具，提供查询执行阶段的详细视图，而不实际运行查询。尽管对非 ClickHouse 专家而言，查看输出可能会感到不知所措，但它仍然是深入了解查询如何执行的重要工具。

文档提供了关于 EXPLAIN 语句是什么以及如何使用它分析查询执行的详细 [指南](/guides/developer/understanding-query-execution-with-the-analyzer)。我们不重复该指南中的内容，而是专注于几个命令，帮助我们找到查询执行性能瓶颈。

**Explain indexes = 1**

我们用 EXPLAIN indexes = 1 来检查查询计划。查询计划是一个树状结构，显示查询将如何执行。在那里，你可以看到查询中的子句将以什么顺序执行。EXPLAIN 语句返回的查询计划可以从下到上进行阅读。

我们尝试使用我们第一个长时间运行的查询。

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

输出是直接的。查询开始时将数据从 `nyc_taxi.trips_small_inferred` 表中读取。然后，应用 WHERE 子句来根据计算的值过滤行。过滤后的数据准备进行聚合，并计算分位数。最后，结果被排序并输出。

在这里，我们可以注意到没有使用主键，这很合理，因为我们在创建该表时没有定义任何主键。因此，ClickHouse 在执行查询时对整张表进行了全表扫描。

**Explain Pipeline**

EXPLAIN Pipeline 展示了查询的具体执行策略。在这里，你可以看到 ClickHouse 实际上是如何执行我们之前查看的通用查询计划的。

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

在这里，我们可以注意到用于执行查询的线程数量：59 个线程，表示出色的并行化。这加快了查询，需要在较小机器上执行的时间会更长。并行运行的线程数量可以解释查询使用的高内存容量。

理想情况下，你应该以相同的方式调查所有慢查询，以识别不必要的复杂查询计划，并了解每个查询读取的行数以及消耗的资源。

## 方法论 {#methodology}

在生产环境中识别问题查询可能很困难，因为在你的 ClickHouse 部署上，可能会有大量查询在任何给定时刻被执行。

如果你知道哪个用户、数据库或表存在问题，可以使用 `system.query_logs` 中的 `user`、`tables` 或 `databases` 字段来缩小搜索范围。

一旦识别出想要优化的查询，你可以着手进行优化。在这个阶段，开发者常犯的一个错误是同时更改多个内容，进行临时实验，最终通常会得出混合结果，但更重要的是缺乏对使查询更快的因素的良好理解。

查询优化需要结构。我不是在谈论高级基准测试，而是在设置一个简单的流程，以了解你的更改如何影响查询性能，这可以带来很大帮助。

首先从查询日志中识别出你的慢查询，然后在隔离状态下调查潜在的改善。当测试查询时，确保禁用文件系统缓存。

> ClickHouse 利用 [缓存](/operations/caches) 在不同阶段加速查询性能。这对于查询性能有好处，但在故障排除期间，可能会隐藏潜在的 I/O 瓶颈或不良的表模式。因此，我建议在测试期间关闭文件系统缓存。在生产环境中确保开启。

一旦识别出潜在的优化，建议逐个实施这些优化，以更好地跟踪它们如何影响性能。下面是描述一般方法的图表。

<Image img={queryOptimizationDiagram1} size="lg" alt="优化工作流程"/>

_最后，注意异常值；查询可能会变慢，这是比较常见的，可能是由于用户尝试了临时的开销查询或者系统因其他原因面临压力。你可以通过字段 normalized_query_hash 分组，识别定期执行的开销查询。这些查询可能就是你想要调查的。_

## 基本优化 {#basic-optimization}

现在我们有了测试的框架，可以开始优化。

开始时最好的地方是看看数据是如何存储的。就像任何数据库一样，我们读取的数据越少，查询执行的速度越快。

根据你摄取数据的方式，你可能利用了 ClickHouse [能力](/interfaces/schema-inference) 根据摄取的数据推断表模式。虽然这在开始时非常方便，但如果你想优化查询性能，你需要审查数据模式，以最适合你的用例。

### Nullable {#nullable}

如 [最佳实践文档](/best-practices/select-data-types#avoid-nullable-columns) 所述，尽可能避免使用 nullable 列。虽然经常使用 nullable 列会使数据摄取机制更灵活，但它们会对性能产生负面影响，因为每次都必须处理额外的列。

运行一个计算 NULL 值行数的 SQL 查询，可以很容易揭示出你表中实际需要 使用 Nullable 值的列。

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

我们只有两个列有 NULL 值：`mta_tax` 和 `payment_type`。其余字段不应该使用 `Nullable` 列。

### 低基数 {#low-cardinality}

对字符串应用的一个简单优化是充分利用 LowCardinality 数据类型。如 [低基数文档](/sql-reference/data-types/lowcardinality) 中所述，ClickHouse 对 LowCardinality 列应用字典编码，这显著提高了查询性能。

确定哪些列是 LowCardinality 的良好候选列的一个简单经验法则是，任何唯一值少于 10,000 的列都是完美候选列。

你可以使用以下 SQL 查询查找具有低唯一值数量的列。

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

对于低基数，这四列 `ratecode_id`、`pickup_location_id`、`dropoff_location_id` 和 `vendor_id` 是 LowCardinality 字段类型的良好候选列。

### 优化数据类型 {#optimize-data-type}

Clickhouse 支持大量数据类型。确保选择符合你的用例的最小数据类型，以优化性能并减少磁盘上的数据存储空间。

对于数字，你可以检查数据集中最小/最大值，以检查当前精度值是否与数据集的实际情况匹配。

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

对于日期，你应选择与数据集相匹配、最适合于回答你打算运行的查询的精度。

### 应用优化 {#apply-the-optimizations}

让我们创建一个新表以使用优化过的模式，并重新导入数据。

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

我们使用新表再次运行查询以检查改进情况。

| 名称    | 运行 1 - 耗时 | 耗时      | 处理的行数     | 峰值内存     |
| ------- | -------------- | --------- | -------------- | ----------- |
| 查询 1  | 1.699 秒       | 1.353 秒  | 3.2904 亿      | 337.12 MiB  |
| 查询 2  | 1.419 秒       | 1.171 秒  | 3.2904 亿      | 531.09 MiB  |
| 查询 3  | 1.414 秒       | 1.188 秒  | 3.2904 亿      | 265.05 MiB  |

我们注意到查询时间和内存使用方面都有一些改善。由于数据模式的优化，我们减少了所代表数据的总数据量，导致内存消耗降低和处理时间缩短。

让我们检查表的大小以查看差异。

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

新表比之前的表小得多。我们看到该表的磁盘空间减少了约 34%（7.38 GiB 对比 4.89 GiB）。

## 主键的重要性 {#the-importance-of-primary-keys}

ClickHouse 中的主键与大多数传统数据库系统中的工作方式有所不同。在这些系统中，主键强制执行唯一性和数据完整性。任何试图插入重复主键值的尝试都会被拒绝，并且通常会为快速查找创建 B 树或基于哈希的索引。

在 ClickHouse 中，主键的 [目标](/guides/best-practices/sparse-primary-indexes#a-table-with-a-primary-key) 是不同的；它不强制执行唯一性或帮助确保数据完整性。相反，它旨在优化查询性能。主键定义了数据在磁盘上的存储顺序，并作为稀疏索引实现，存储指向每个 granule 第一行的指针。

> 在 ClickHouse 中，granules 是在查询执行期间读取的最小数据单位。它们包含最多固定数量的行，由 index_granularity 决定，默认值为 8192 行。granules 是连续存储并按主键排序的。

选择一组好的主键对于性能很重要，实际上，通常会在不同的表中存储相同的数据，并使用不同的主键集合来加速特定的查询集合。

ClickHouse 支持的其他选项，如投影或物化视图，允许你对相同数据使用不同的主键集。该博客系列的第二部分将对此进行更深入的讲解。

### 选择主键 {#choose-primary-keys}

选择正确的主键集合是一个复杂的话题，可能需要权衡和实验以找到最佳组合。

目前，我们将遵循以下简单做法：

-   使用在大多数查询中用于过滤的字段
-   首先选择基数较低的列
-   在你的主键中考虑基于时间的组件，因为在时间戳数据集上按时间过滤是很常见的。

在我们的案例中，我们将尝试以下主键：`passenger_count`、`pickup_datetime` 和 `dropoff_datetime`。

`passenger_count` 的基数很小（24 个唯一值），并且使用于我们的慢查询中。我们还添加了时间戳字段（`pickup_datetime` 和 `dropoff_datetime`），因为它们经常被过滤。

创建一个带有主键的新表并重新导入数据。

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

然后我们重新运行我们的查询。我们汇总了三次实验的结果，以查看在耗时、处理的行数和内存消耗方面的改进。

<table>
  <thead>
    <tr>
      <th colspan="4">查询 1</th>
    </tr>
    <tr>
      <th></th>
      <th>运行 1</th>
      <th>运行 2</th>
      <th>运行 3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>耗时</td>
      <td>1.699 秒</td>
      <td>1.353 秒</td>
      <td>0.765 秒</td>
    </tr>
    <tr>
      <td>处理的行数</td>
      <td>3.2904 亿</td>
      <td>3.2904 亿</td>
      <td>3.2904 亿</td>
    </tr>
    <tr>
      <td>峰值内存</td>
      <td>440.24 MiB</td>
      <td>337.12 MiB</td>
      <td>444.19 MiB</td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th colspan="4">查询 2</th>
    </tr>
    <tr>
      <th></th>
      <th>运行 1</th>
      <th>运行 2</th>
      <th>运行 3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>耗时</td>
      <td>1.419 秒</td>
      <td>1.171 秒</td>
      <td>0.248 秒</td>
    </tr>
    <tr>
      <td>处理的行数</td>
      <td>3.2904 亿</td>
      <td>3.2904 亿</td>
      <td>41.46 百万</td>
    </tr>
    <tr>
      <td>峰值内存</td>
      <td>546.75 MiB</td>
      <td>531.09 MiB</td>
      <td>173.50 MiB</td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th colspan="4">查询 3</th>
    </tr>
    <tr>
      <th></th>
      <th>运行 1</th>
      <th>运行 2</th>
      <th>运行 3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>耗时</td>
      <td>1.414 秒</td>
      <td>1.188 秒</td>
      <td>0.431 秒</td>
    </tr>
    <tr>
      <td>处理的行数</td>
      <td>3.2904 亿</td>
      <td>3.2904 亿</td>
      <td>276.99 百万</td>
    </tr>
    <tr>
      <td>峰值内存</td>
      <td>451.53 MiB</td>
      <td>265.05 MiB</td>
      <td>197.38 MiB</td>
    </tr>
  </tbody>
</table>

我们可以看到在执行时间和内存使用方面都有显著的改善。

查询 2 从主键中受益最大。让我们来看一下生成的查询计划与之前的不同之处。

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

由于主键，只选择了表 granules 的一个子集。这大大提高了查询性能，因为 ClickHouse 需要处理的数据量显著减少。

## 后续步骤 {#next-steps}

希望本指南能让你很好地理解如何使用 ClickHouse 调查慢查询以及如何使它们更快。要进一步探索这个主题，你可以阅读更多关于 [查询分析器](/operations/analyzer) 和 [分析](/operations/optimizing-performance/sampling-query-profiler) 的内容，以更好地理解 ClickHouse 是如何执行查询的。

随着你对 ClickHouse 特性的熟悉，我建议你阅读有关 [分区键](/optimize/partitioning-key) 和 [数据跳过索引](/optimize/skipping-indexes) 的内容，以了解更多可以加速查询的高级技术。
