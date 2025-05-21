---
'slug': '/optimize/query-optimization'
'sidebar_label': '查询优化'
'title': '查询优化指南'
'description': '一份简单的查询优化指南，描述了提高查询性能的常见方法'
---

import queryOptimizationDiagram1 from '@site/static/images/guides/best-practices/query_optimization_diagram_1.png';
import Image from '@theme/IdealImage';


# 一个关于查询优化的简单指南

本节旨在通过常见场景说明如何使用不同的性能和优化技术，例如 [analyzer](/operations/analyzer)、[查询分析](/operations/optimizing-performance/sampling-query-profiler) 或 [避免使用 Nullable 列](/optimize/avoid-nullable-columns)，以提高您的 ClickHouse 查询性能。

## 理解查询性能 {#understand-query-performance}

考虑性能优化的最佳时机是在您首次将数据导入 ClickHouse 之前设置您的 [数据模式](/data-modeling/schema-design)。

但让我们诚实地说；预测数据将增长多少或将执行什么类型的查询是很困难的。

如果您有一个现有的部署，想要改善几个查询，第一步是理解这些查询的执行性能，以及为什么一些查询在几毫秒内执行而另一些则需要更长时间。

ClickHouse 提供了一套丰富的工具，帮助您理解查询是如何执行的以及执行时消耗了多少资源。

在这一部分，我们将查看这些工具及其使用方法。

## 一般考虑 {#general-considerations}

为了理解查询性能，让我们看看 ClickHouse 在执行查询时发生了什么。

以下部分故意简化并采用了一些捷径；这里的目的是不希望让您淹没于细节，而是让您理解基本概念。如需更多信息，您可以阅读有关 [查询分析器](/operations/analyzer)。

从非常高的层次来看，当 ClickHouse 执行查询时，会发生以下事项：

- **查询解析和分析**

查询被解析和分析，并创建一个通用查询执行计划。

- **查询优化**

查询执行计划被优化，冗余数据被修剪，并从查询计划中构建查询管道。

- **查询管道执行**

数据被并行读取和处理。这是 ClickHouse 实际执行查询操作（例如过滤、聚合和排序）的阶段。

- **最终处理**

结果被合并、排序，并格式化成最终结果，然后发送给客户端。

实际上，许多 [优化](/concepts/why-clickhouse-is-so-fast) 正在进行中，我们将在本指南中进一步讨论，但现在，这些主要概念使我们对 ClickHouse 执行查询时发生的事情有了良好的理解。

有了这种高层次的理解，让我们来检查 ClickHouse 提供的工具以及我们如何使用它来跟踪影响查询性能的指标。

## 数据集 {#dataset}

我们将使用一个实际示例来说明我们如何处理查询性能。

我们使用 NYC Taxi 数据集，该数据集包含纽约市的出租车行程数据。首先，我们开始导入未经优化的 NYC 出租车数据集。

以下是创建表并从 S3 存储桶插入数据的命令。请注意，我们自愿根据数据推断模式，而不是优化的。

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

让我们看看从数据自动推断出的表模式。

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

## 发现慢查询 {#spot-the-slow-queries}

### 查询日志 {#query-logs}

默认情况下，ClickHouse 收集并记录每个执行查询的信息，记录在 [查询日志](/operations/system-tables/query_log) 中。这些数据存储在 `system.query_log` 表中。

对于每个执行的查询，ClickHouse 记录统计信息，例如查询执行时间、读取的行数和资源使用情况，例如 CPU、内存使用或文件系统缓存命中。

因此，查询日志是调查慢查询的一个好地方。您可以轻松找到执行时间较长的查询并显示每个查询的资源使用信息。

让我们找出 NYC 出租车数据集中运行时间最长的前五个查询。

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

字段 `query_duration_ms` 指示特定查询执行的时间。查看查询日志的结果，我们可以看到第一个查询需要 2967ms 执行，这可以优化。

您可能还希望通过检查消耗最多内存或 CPU 的查询来了解哪些查询正在给系统带来压力。

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

让我们将找到的长时间运行的查询隔离开来并重新运行几次，以理解响应时间。

此时，至关重要的是将 `enable_filesystem_cache` 设置为 0 以关闭文件系统缓存，从而提高可重复性。

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

将结果总结在表格中，便于阅读。

| 名称    | 耗时     | 处理的行数      | 峰值内存       |
| ------- | -------- | --------------- | -------------- |
| 查询 1 | 1.699 秒 | 329.04 百万行 | 440.24 MiB     |
| 查询 2 | 1.419 秒 | 329.04 百万行 | 546.75 MiB     |
| 查询 3 | 1.414 秒 | 329.04 百万行 | 451.53 MiB     |

让我们更好地理解这些查询的目的。

- 查询 1 计算以平均速度超过 30 英里每小时的行程的距离分布。
- 查询 2 找出每周行程的数量和平均花费。
- 查询 3 计算数据集中每次旅行的平均时间。

除了第一个查询在每次查询执行时动态计算旅行时间外，这些查询都没有进行非常复杂的处理。然而，每个查询执行时间都超过一秒，这在 ClickHouse 的世界里是非常长的。我们还可以注意到这些查询的内存使用；每个查询大约 400 Mb 的内存是相当多的。此外，每个查询似乎读取的行数都是相同的（即 329.04 百万行）。让我们迅速确认这个表中有多少行。

```sql
-- Count number of rows in table
SELECT count()
FROM nyc_taxi.trips_small_inferred

Query id: 733372c5-deaf-4719-94e3-261540933b23

   ┌───count()─┐
1. │ 329044175 │ -- 329.04 million
   └───────────┘
```

该表包含 329.04 百万行，因此每个查询都在执行全表扫描。

### Explain 语句 {#explain-statement}

现在我们有了一些长时间运行的查询，让我们理解它们是如何执行的。为此，ClickHouse 支持 [EXPLAIN 语句命令](/sql-reference/statements/explain)。这是一个非常有用的工具，提供了所有查询执行阶段的详细视图，而无需实际运行查询。虽然对非 ClickHouse 专家来说，查看这些内容可能会让人不知所措，但它仍然是获得查询执行方式见解的基本工具。

文档提供了详细的 [指南](/guides/developer/understanding-query-execution-with-the-analyzer)，介绍了 EXPLAIN 语句是什么以及如何使用它分析查询执行。我们不会重复该指南中的内容，而是集中于一些命令，帮助我们找到查询执行性能的瓶颈。

**Explain indexes = 1**

让我们从 EXPLAIN indexes = 1 开始，检查查询计划。查询计划是一个树，显示查询将如何执行。您可以看到查询中各个子句的执行顺序。从底部到顶部可以阅读 EXPLAIN 语句返回的查询计划。

让我们尝试使用我们的第一个长时间运行的查询。

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

输出是直接的。查询开始于从 `nyc_taxi.trips_small_inferred` 表读取数据。然后，应用 WHERE 子句根据计算的值过滤行。过滤后的数据为聚合准备，计算出分位数。最后，结果被排序并输出。

在这里，我们可以注意到没有使用主键，这很合理，因为我们在创建表时没有定义任何主键。因此，ClickHouse 在查询时进行全表扫描。

**Explain Pipeline**

EXPLAIN Pipeline 显示查询的具体执行策略。在这里，您可以看到 ClickHouse 实际如何执行我们之前查看的通用查询计划。

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

在这里，我们可以注意到用于执行查询的线程数量：59 个线程，表明高度并行化。这加快了查询速度，而在小型机器上执行查询则更长。并行运行的线程数量可以解释查询消耗的高内存量。

理想情况下，您应该以同样的方式调查所有慢查询，以识别不必要的复杂查询计划，并了解每个查询读取的行数和消耗的资源。

## 方法论 {#methodology}

在生产部署中识别问题查询可能很困难，因为在您的 ClickHouse 部署中，可能同时执行大量查询。

如果您知道是哪个用户、数据库或表出现问题，您可以使用 `system.query_logs` 中的 `user`、`tables` 或 `databases` 字段来缩小搜索范围。

一旦您确定要优化的查询，就可以开始着手优化。此时开发者常犯的一个常见错误是同时更改多个内容，进行临时实验，通常得出的结果混乱，但更重要的是，缺乏对是什么让查询更快的良好理解。

查询优化需要结构。我不是在谈论高级基准测试，而是建立一个简单的流程，以了解您的更改如何影响查询性能可以大有裨益。

从查询日志中识别慢查询开始，然后孤立地调查潜在的改进。在测试查询时，请确保禁用文件系统缓存。

> ClickHouse 利用 [缓存](/operations/caches) 在不同阶段加速查询性能。这有利于查询性能，但在故障排除期间，它可能会掩盖潜在的 I/O 瓶颈或糟糕的表模式。因此，我建议在测试期间关闭文件系统缓存。在生产设置中确保启用它。

一旦您识别出潜在的优化，建议您逐个实施，以更好地跟踪它们如何影响性能。下面是描述一般方法的图表。

<Image img={queryOptimizationDiagram1} size="lg" alt="优化工作流"/>

_最后，谨防异常值；查询运行缓慢是很常见的，可能是因为用户尝试了一个临时的高昂查询或系统在其他原因下处于压力状态。您可以通过字段 normalized_query_hash 分组，以识别定期执行的高费用查询。那些可能是您想要调查的内容。_

## 基本优化 {#basic-optimization}

现在我们有了测试框架，可以开始优化。

最佳起点是查看数据的存储方式。对于任何数据库来说，我们读取的数据越少，查询的执行速度就会越快。

根据您导入数据的方式，您可能利用了 ClickHouse 的 [功能](/interfaces/schema-inference)，根据导入的数据推断表模式。虽然这在开始时非常实用，但如果您想优化查询性能，您需要审查数据模式，以更好地适应您的用例。

### Nullable {#nullable}

如 [最佳实践文档](/best-practices/select-data-types#avoid-nullable-columns) 所述，尽可能避免使用 nullable 列。尽管它们使数据导入机制更灵活，但使用它们会对性能产生负面影响，因为每次都需要处理额外的列。

运行一个计数行中 NULL 值的 SQL 查询，可以轻松揭示您表中实际上需要 Nullable 值的列。

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

我们只有两列具有空值：`mta_tax` 和 `payment_type`。其余的字段不应使用 `Nullable` 列。

### 低基数 {#low-cardinality}

对字符串的一个简单优化是充分利用 LowCardinality 数据类型。如 [低基数文档](/sql-reference/data-types/lowcardinality) 中所述，ClickHouse 对 LowCardinality 列应用字典编码，这显著提高了查询性能。

确定哪些列适合 LowCardinality 的一个简单法则是，任何具有少于 10,000 个唯一值的列都是完美候选。

您可以使用以下 SQL 查询查找具有少量唯一值的列。

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

由于基数较低，这四列 `ratecode_id`、`pickup_location_id`、`dropoff_location_id` 和 `vendor_id` 是适合 LowCardinality 字段类型的良好候选者。

### 优化数据类型 {#optimize-data-type}

ClickHouse 支持大量数据类型。确保选择适合您用例的最小数据类型，以优化性能并减少在磁盘上的数据存储空间。

对于数字，您可以检查数据集中最小/最大值，以确定当前的精度值是否与数据集实际情况相符。

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

对于日期，您应选择与数据集匹配的精度，并最适合回答您计划运行的查询。

### 应用优化 {#apply-the-optimizations}

让我们创建一个新表以使用优化后的模式并重新导入数据。

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

我们再次使用新表运行查询以检查改进情况。

| 名称    | 运行 1 - 耗时 | 耗时     | 处理的行数      | 峰值内存       |
| ------- | -------------- | -------- | --------------- | -------------- |
| 查询 1 | 1.699 秒       | 1.353 秒 | 329.04 百万行 | 337.12 MiB     |
| 查询 2 | 1.419 秒       | 1.171 秒 | 329.04 百万行 | 531.09 MiB     |
| 查询 3 | 1.414 秒       | 1.188 秒 | 329.04 百万行 | 265.05 MiB     |

我们注意到查询时间和内存使用情况都有所改善。由于数据模式的优化，我们减少了表示我们数据的总数据量，从而改善了内存消耗并减少了处理时间。

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

新表的体积明显小于之前的表。我们看到表的磁盘空间减少了约 34%（7.38 GiB vs 4.89 GiB）。

## 主键的重要性 {#the-importance-of-primary-keys}

ClickHouse 中的主键与大多数传统数据库系统的工作方式不同。在这些系统中，主键强制确保唯一性和数据完整性。任何尝试插入重复主键值的操作都会被拒绝，并且通常会为快速查找创建 B 树或基于哈希的索引。

在 ClickHouse 中，主键的 [目标](/guides/best-practices/sparse-primary-indexes#a-table-with-a-primary-key) 是不同的；它不会强制唯一性或帮助数据完整性。相反，它旨在优化查询性能。主键定义数据在磁盘上存储的顺序，并作为稀疏索引实现，存储指向每个粒度第一个行的指针。

> ClickHouse 中的粒度是查询执行过程中读取的最小数据单位。它们最多包含固定数量的行，由 index_granularity 确定，默认值为 8192 行。粒度连续存储并按主键排序。

选择一组良好的主键对于性能非常重要，实际上，常常会在不同的表中存储相同的数据，并使用不同的主键集来加速特定的查询集合。

ClickHouse 支持的其他选项，如 Projection 或 Materialized view，允许您在同一数据上使用不同的主键集合。本系列博客的第二部分将对此进行更详细的讨论。

### 选择主键 {#choose-primary-keys}

选择正确的一组主键是一个复杂的话题，可能需要权衡和实验以找到最佳组合。

现在，我们将遵循以下简单实践：

- 使用大多数查询中用于过滤的字段。
- 优先选择基数较低的列。
- 考虑在主键中包含基于时间的组件，因为在时间戳数据集中按时间过滤非常常见。

在我们的情况下，我们将尝试以下主键：`passenger_count`、`pickup_datetime` 和 `dropoff_datetime`。

乘客数的基数较小（24 个唯一值），并且在我们的慢查询中使用。我们还添加时间戳字段（`pickup_datetime` 和 `dropoff_datetime`），因为它们可以经常被过滤。

创建一个具有主键的新表并重新导入数据。

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

然后我们重新运行查询。我们收集三个实验的结果，以查看耗时、处理的行数和内存消耗的改进。

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
      <td>329.04 百万行</td>
      <td>329.04 百万行</td>
      <td>329.04 百万行</td>
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
      <td>329.04 百万行</td>
      <td>329.04 百万行</td>
      <td>41.46 百万行</td>
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
      <td>329.04 百万行</td>
      <td>329.04 百万行</td>
      <td>276.99 百万行</td>
    </tr>
    <tr>
      <td>峰值内存</td>
      <td>451.53 MiB</td>
      <td>265.05 MiB</td>
      <td>197.38 MiB</td>
    </tr>
  </tbody>
</table>

我们可以看到，在执行时间和内存使用方面都有显著改善。

查询 2 受益于主键。让我们看看生成的查询计划与之前的不同之处。

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

由于主键的存在，仅选择了表粒度的一个子集。这对查询性能的提升有很大帮助，因为 ClickHouse 需要处理的数据显示显著减少。

## 下一步 {#next-steps}

希望本指南能帮助您更好地理解如何使用 ClickHouse 调查慢查询以及如何使其更快。要更深入地探索此主题，您可以阅读有关 [查询分析器](/operations/analyzer) 和 [分析](/operations/optimizing-performance/sampling-query-profiler) 的更多内容，以更好地理解 ClickHouse 是如何执行您的查询的。

随着您对 ClickHouse 特性的熟悉，我建议您阅读有关 [分区键](/optimize/partitioning-key) 和 [数据跳过索引](/optimize/skipping-indexes) 的内容，以了解可以用来加速查询的更高级技术。
