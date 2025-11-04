---
'slug': '/optimize/query-optimization'
'sidebar_label': '查询优化'
'title': '查询优化指南'
'description': '一个简单的查询优化指南，描述了提高查询性能的常见方法'
'doc_type': 'guide'
---

import queryOptimizationDiagram1 from '@site/static/images/guides/best-practices/query_optimization_diagram_1.png';
import Image from '@theme/IdealImage';


# 一个简单的查询优化指南

本节旨在通过常见场景说明如何使用不同的性能和优化技术，比如 [analyzer](/operations/analyzer)、[query profiling](/operations/optimizing-performance/sampling-query-profiler) 或 [避免 Nullable 列](/optimize/avoid-nullable-columns)，以提高 ClickHouse 查询性能。

## 理解查询性能 {#understand-query-performance}

考虑性能优化的最佳时机是在首次将数据导入 ClickHouse 之前设置您的 [数据模式](/data-modeling/schema-design)。

但说实话；很难预测您的数据将增长多少或将执行哪些类型的查询。

如果您有一个现有的部署，并且想要改善几个查询，第一步是理解这些查询的性能，以及为什么有些查询需要几毫秒才能执行，而另一些则需要更长时间。

ClickHouse 提供了一套丰富的工具，帮助您理解查询是如何执行的，以及执行过程中消耗的资源。

在本节中，我们将查看这些工具以及如何使用它们。

## 一般考虑 {#general-considerations}

要理解查询性能，首先我们要了解在 ClickHouse 中执行查询时会发生什么。

以下部分经过简化，采取了一些简化措施；此处的目的不是给您灌输细节，而是让您了解基本概念。有关更多信息，您可以阅读 [查询分析器](/operations/analyzer)。

从一个非常高层的角度看，当 ClickHouse 执行查询时，发生以下情况：

- **查询解析和分析**

查询被解析和分析，并创建一个通用的查询执行计划。

- **查询优化**

查询执行计划被优化，冗余数据被修剪，并根据查询计划构建查询管道。

- **查询管道执行**

数据被并行读取和处理。在这一阶段，ClickHouse 实际上执行查询操作，比如过滤、聚合和排序。

- **最终处理**

结果被合并、排序并格式化为最终结果，然后发送到客户端。

实际上，会发生许多 [优化](/concepts/why-clickhouse-is-so-fast)，我们将在本指南中详细讨论，但现在，这些主要概念使我们对 ClickHouse 执行查询时背后发生的事情有了良好的理解。

有了这一高层次的理解，让我们来看看 ClickHouse 提供的工具，以及如何使用它来跟踪影响查询性能的指标。

## 数据集 {#dataset}

我们将使用一个真实的例子来说明我们如何处理查询性能。

让我们使用 NYC Taxi 数据集，它包含纽约市的出租车行程数据。首先，我们开始导入没有优化的 NYC 出租车数据集。

以下是从 S3 存储桶创建表并插入数据的命令。请注意，我们自愿从数据中推断出模式，这并没有经过优化。

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

让我们看看从数据中自动推断的表模式。

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

## 识别慢查询 {#spot-the-slow-queries}

### 查询日志 {#query-logs}

默认情况下，ClickHouse 收集并记录每个执行查询的信息，存储在 [查询日志](/operations/system-tables/query_log) 中。该数据存储在表 `system.query_log` 中。

对于每个执行的查询，ClickHouse 记录统计信息，比如查询执行时间、读取的行数和资源使用情况，例如 CPU、内存使用或文件系统缓存命中。

因此，查询日志是调查慢查询的良好起点。您可以轻松查看执行时间较长的查询，并显示每个查询的资源使用信息。

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

字段 `query_duration_ms` 表示该特定查询的执行时间。从查询日志的结果看来，第一个查询运行需要 2967 毫秒，这可以进行改进。

您可能还想通过检查使用最多内存或 CPU 的查询，来了解哪些查询正在给系统施加压力。

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

让我们隔离发现的长时间运行查询，并重新运行几次以理解响应时间。

在这一点上，关闭文件系统缓存非常重要，通过将 `enable_filesystem_cache` 设置为 0 来提高可重复性。

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

总结成表格以便于阅读。

| 名称    | 消耗时间   | 处理的行数 | 峰值内存  |
| ------- | --------- | -------------- | ----------- |
| 查询 1 | 1.699 秒 | 3.2904 亿    | 440.24 MiB  |
| 查询 2 | 1.419 秒 | 3.2904 亿    | 546.75 MiB  |
| 查询 3 | 1.414 秒 | 3.2904 亿    | 451.53 MiB  |

让我们更加了解一下这些查询的作用。

- 查询 1 计算以超过 30 英里每小时的平均速度的行程距离分布。
- 查询 2 查找每周的行程数量和平均费用。
- 查询 3 计算数据集中每次行程的平均时间。

这些查询并没有进行非常复杂的处理，除了第一个查询在每次执行时按需计算行程时间。然而，这些查询的执行时间都超过了一秒钟，在 ClickHouse 的世界中，这是非常长的时间。我们还可以注意到这些查询的内存使用情况；每个查询大约 400 MB 的内存用量相当高。此外，每个查询似乎读取的行数是相同的（即 3.2904 亿）。让我们快速确认一下这个表中有多少行。

```sql
-- Count number of rows in table
SELECT count()
FROM nyc_taxi.trips_small_inferred

Query id: 733372c5-deaf-4719-94e3-261540933b23

   ┌───count()─┐
1. │ 329044175 │ -- 329.04 million
   └───────────┘
```

表中包含 3.2904 亿行，因此每个查询都在对表进行完整扫描。

### Explain 语句 {#explain-statement}

现在我们有了一些长时间运行的查询，让我们了解它们是如何执行的。为此，ClickHouse 支持 [EXPLAIN 语句命令](/sql-reference/statements/explain)。它是一个非常有用的工具，提供了所有查询执行阶段的详细视图，而无需实际运行查询。虽然对非 ClickHouse 专家来说，查看这个可能令人不知所措，但它仍然是深入了解查询执行方式的重要工具。

文档提供了关于 EXPLAIN 语句是什么以及如何使用它分析查询执行的详细 [指南](/guides/developer/understanding-query-execution-with-the-analyzer)。我们不会重复这本指南中的内容，而是专注于一些将帮助我们找到查询执行性能瓶颈的命令。

**Explain indexes = 1**

首先使用 EXPLAIN indexes = 1 来检查查询计划。查询计划是一个表明查询将如何执行的树形结构。您可以看到查询的子句将以何种顺序被执行。EXPLAIN 语句返回的查询计划可以从下到上读取。

让我们尝试使用我们的一条长时运行查询。

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

输出非常简单。查询首先从 `nyc_taxi.trips_small_inferred` 表中读取数据。然后，应用 WHERE 子句根据计算的值过滤行。筛选后的数据被准备进行聚合，计算分位数。最后，结果被排序并输出。

在这里，我们可以注意到没有使用主键，这很合理，因为在创建表时我们没有定义任何主键。因此，ClickHouse 对查询进行了全表扫描。

**Explain Pipeline**

EXPLAIN Pipeline 显示了查询的具体执行策略。在这里，您可以看到 ClickHouse 实际上如何执行我们之前看到的通用查询计划。

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

在这里，我们可以注意到用于执行查询的线程数量：59 个线程，指示出高度并行化。这加速了查询，在较小的机器上执行将花费更长时间。并行运行的线程数量可以解释查询使用的高内存量。

理想情况下，您将以相同的方式调查所有的慢查询，以识别不必要的复杂查询计划，并了解每个查询读取的行数和消耗的资源。

## 方法论 {#methodology}

在生产环境中识别问题查询可能很困难，因为在您的 ClickHouse 部署上，可能在任何给定时间都有大量查询被执行。

如果您知道哪个用户、数据库或表存在问题，可以使用 `system.query_logs` 中的 `user`、`tables` 或 `databases` 字段来缩小搜索范围。

一旦确定要优化的查询，您可以开始对它们进行优化。在这一阶段，开发人员常犯的一个常见错误是同时更改多个内容，进行临时实验，通常以混合结果告终，但更重要的是，缺乏对使查询更快的原因的良好理解。

查询优化需要结构。我不是在谈论高级基准测试，而是在简单的过程中了解您的更改如何影响查询性能会有很大帮助。

首先，从查询日志中识别您的慢查询，然后逐个调查潜在的改进。当测试查询时，请确保禁用文件系统缓存。

> ClickHouse 利用 [缓存](/operations/caches) 在不同阶段加速查询性能。这对查询性能是有好处的，但在故障排除期间，它可能会掩盖潜在的 I/O 瓶颈或不良的表模式。因此，我建议在测试期间关闭文件系统缓存。确保在生产设置中启用它。

一旦您识别出潜在的优化，建议逐一实施，以便更好地跟踪它们如何影响性能。以下是描述一般方法的图表。

<Image img={queryOptimizationDiagram1} size="lg" alt="优化工作流"/>

_最后，要谨慎对待异常情况；查询可能运行缓慢是相当常见的，可能是因为用户尝试了一个临时的昂贵查询，或者系统因其他原因承受压力。您可以按字段 normalized_query_hash 分组，确定定期执行的昂贵查询。这些可能是您想要调查的查询。_

## 基本优化 {#basic-optimization}

现在我们已经有了测试的框架，我们可以开始优化。

开始的最佳地方是查看数据的存储方式。对于任何数据库而言，读取的数据越少，查询的执行速度就越快。

根据您如何导入数据，您可能已经利用 ClickHouse 的 [能力](/interfaces/schema-inference) 根据导入的数据推断出表模式。尽管这对于开始工作非常实用，但如果您想优化查询性能，则需要审查数据模式，以最好地适应用例。

### Nullable {#nullable}

如 [最佳实践文档](/best-practices/select-data-types#avoid-nullable-columns) 中所述，尽量避免使用 Nullable 列。经常使用它们似乎很诱人，因为它们使数据导入机制更加灵活，但它们对性能产生了负面影响，因为每次都必须处理额外的列。

运行统计计数 NULL 值的 SQL 查询可以轻易揭示您表中实际上需要 Nullable 值的列。

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

我们只有两个包含空值的列：`mta_tax` 和 `payment_type`。其余字段不应使用 `Nullable` 列。

### 低基数 {#low-cardinality}

对字符串施加的简单优化是充分利用 LowCardinality 数据类型。如低基数 [文档](/sql-reference/data-types/lowcardinality) 中所述，ClickHouse 对 LowCardinality 列应用字典编码，这显著提高了查询性能。

判断哪些列适合 LowCardinality 的简单经验法则是：任何唯一值少于 10,000 的列都是绝佳候选者。

您可以使用以下 SQL 查询查找唯一值数量少的列。

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

具有低基数的这四列，`ratecode_id`、`pickup_location_id`、`dropoff_location_id` 和 `vendor_id`，是良好的 LowCardinality 字段类型候选者。

### 优化数据类型 {#optimize-data-type}

ClickHouse 支持大量数据类型。请确保选择适合您用例的尽可能小的数据类型，以优化性能并减少磁盘上的数据存储空间。

对于数字，您可以检查数据集中最小/最大值，以检查当前的精度值是否与数据集的实际情况相符。

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

对于日期，您应该选择与数据集相匹配并最适合回答您计划执行的查询的精度。

### 应用优化 {#apply-the-optimizations}

让我们创建一个新表以使用优化模式，并重新导入数据。

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

我们再次使用新表运行查询，以检查改进情况。

| 名称    | 运行 1 - 消耗时间 | 消耗时间   | 处理的行数 | 峰值内存 |
| ------- | --------------- | --------- | -------------- | ----------- |
| 查询 1 | 1.699 秒       | 1.353 秒 | 3.2904 亿   | 337.12 MiB  |
| 查询 2 | 1.419 秒       | 1.171 秒 | 3.2904 亿   | 531.09 MiB  |
| 查询 3 | 1.414 秒       | 1.188 秒 | 3.2904 亿   | 265.05 MiB  |

我们注意到查询时间和内存使用情况都有所改善。感谢数据模式的优化，我们减少了表示数据的总数据量，导致内存消耗得到改善，并缩短了处理时间。

让我们检查一下表的大小以查看差异。

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

新表比之前的表小得多。我们看到表的磁盘空间减少了约 34%（7.38 GiB 对比 4.89 GiB）。

## 主键的重要性 {#the-importance-of-primary-keys}

ClickHouse 中的主键与大多数传统数据库系统的工作原理不同。在这些系统中，主键强制唯一性和数据完整性。任何试图插入重复主键值的操作都会被拒绝，并通常会创建 B 树或基于哈希的索引以实现快速查找。

在 ClickHouse 中，主键的 [目标](/guides/best-practices/sparse-primary-indexes#a-table-with-a-primary-key) 是不同的；它不会强制唯一性或帮助数据完整性。相反，它旨在优化查询性能。主键定义了数据在磁盘上的存储顺序，并实现为稀疏索引，存储指向每个粒度第一行的指针。

> ClickHouse 中的颗粒是查询执行期间读取的最小数据单元。它们包含固定数量的行，由 index_granularity 确定，默认值为 8192 行。颗粒按主键连续存储且排序。

选择一组良好的主键对性能至关重要，实际上，常见的做法是在不同的表中存储相同的数据，并使用不同的主键组合来加速特定的一组查询。

ClickHouse 支持的其他选项，如投影或物化视图，允许您对同一数据使用不同的主键集合。本系列博客的第二部分将对此进行更详细的讨论。

### 选择主键 {#choose-primary-keys}

选择正确的主键组合是一个复杂的话题，可能需要权衡和实验以找到最佳组合。

目前，我们将遵循这些简单的做法：

- 使用在大多数查询中被用作过滤的字段
- 优先选择基数较低的列
- 考虑在主键中包含基于时间的组件，因为在时间戳数据集中按时间过滤是相当常见的。

在我们的案例中，我们将尝试以下主键：`passenger_count`、`pickup_datetime` 和 `dropoff_datetime`。

乘客数量的基数较小（24 个唯一值），并在我们缓慢的查询中被使用。我们还添加时间戳字段（`pickup_datetime` 和 `dropoff_datetime`），因为它们通常可以被过滤。

创建一个新的包含主键的表，并重新导入数据。

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

然后我们重新运行查询。我们将三次实验的结果汇总，以查看消耗时间、处理的行数和内存使用情况的改善情况。

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
      <td>消耗时间</td>
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
      <td>消耗时间</td>
      <td>1.419 秒</td>
      <td>1.171 秒</td>
      <td>0.248 秒</td>
    </tr>
    <tr>
      <td>处理的行数</td>
      <td>3.2904 亿</td>
      <td>3.2904 亿</td>
      <td>4146 万</td>
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
      <td>消耗时间</td>
      <td>1.414 秒</td>
      <td>1.188 秒</td>
      <td>0.431 秒</td>
    </tr>
    <tr>
      <td>处理的行数</td>
      <td>3.2904 亿</td>
      <td>3.2904 亿</td>
      <td>2.7699 亿</td>
    </tr>
    <tr>
      <td>峰值内存</td>
      <td>451.53 MiB</td>
      <td>265.05 MiB</td>
      <td>197.38 MiB</td>
    </tr>
  </tbody>
</table>

我们可以看到执行时间和使用内存的显著改善。

查询 2 受益于主键的改进。让我们看看生成的查询计划与之前有何不同。

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

感谢主键的存在，仅选择了部分表颗粒。这大大提高了查询性能，因为 ClickHouse 处理的数据显著减少。

## 下一步 {#next-steps}

希望本指南能帮助您更好地理解如何使用 ClickHouse 调查慢查询以及如何使其更快。要进一步了解此主题，您可以阅读有关 [查询分析器](/operations/analyzer) 和 [概况分析](/operations/optimizing-performance/sampling-query-profiler) 的更多内容，以更详细地理解 ClickHouse 如何执行您的查询。

随着您对 ClickHouse 特性的熟悉，我建议您阅读有关 [分区键](/optimize/partitioning-key) 和 [数据跳过索引](/optimize/skipping-indexes) 的内容，以了解可以用来加速查询的更高级技术。
