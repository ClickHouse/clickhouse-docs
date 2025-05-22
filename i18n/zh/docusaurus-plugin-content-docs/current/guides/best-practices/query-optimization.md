import queryOptimizationDiagram1 from '@site/static/images/guides/best-practices/query_optimization_diagram_1.png';
import Image from '@theme/IdealImage';

# 查询优化的简单指南

本节旨在通过常见场景说明如何使用不同的性能和优化技术，如 [analyzer](/operations/analyzer)、[查询分析](/operations/optimizing-performance/sampling-query-profiler) 或 [避免使用 Nullable 列](/optimize/avoid-nullable-columns)，以提高你的 ClickHouse 查询性能。

## 理解查询性能 {#understand-query-performance}

考虑性能优化的最佳时机是在首次将数据导入 ClickHouse 之前设置 [数据模式](/data-modeling/schema-design)。

但坦白说，预测你的数据增长多少或将执行哪些类型的查询是很困难的。

如果你有一个现有的部署，想要改进一些查询，第一步是理解这些查询的性能，以及为什么有些查询在几毫秒内执行完成，而其他查询则需要更长的时间。

ClickHouse 提供了一系列丰富的工具来帮助你理解查询是如何执行的，以及执行时消耗的资源。

在本节中，我们将介绍这些工具及其使用方法。

## 一般考虑 {#general-considerations}

要理解查询性能，我们来看看 ClickHouse 在执行查询时会发生什么。

以下部分经过简化，采取了一些简化的描述；此处的想法并不是让你淹没在细节中，而是让你快速掌握基本概念。要获取更多信息，请阅读 [查询分析器](/operations/analyzer)。

从一个非常高的层面来看，当 ClickHouse 执行查询时，会发生以下事情：

  - **查询解析和分析**

查询被解析和分析，生成一个通用的查询执行计划。

  - **查询优化**

查询执行计划被优化，不必要的数据被修剪，并根据查询计划构建查询管道。

  - **查询管道执行**

数据以并行方式读取和处理。在此阶段，ClickHouse 实际上执行查询操作，如过滤、聚合和排序。

  - **最终处理**

结果被合并、排序并格式化为最终结果，然后发送给客户端。

实际上，会进行许多 [优化](/concepts/why-clickhouse-is-so-fast)，我们将在本指南中讨论它们，但目前这些主要概念让我们很好地理解了 ClickHouse 执行查询时发生的事情。

有了这个高层次的理解，接下来我们来看看 ClickHouse 提供的工具，以及我们如何使用它来跟踪影响查询性能的指标。

## 数据集 {#dataset}

我们将使用一个真实的例子来说明我们如何处理查询性能。

让我们使用 NYC Taxi 数据集，该数据集包含纽约市的出租车乘车数据。首先，我们开始导入没有优化的 NYC出租车数据集。

下面是创建表并从 S3 存储桶插入数据的命令。请注意，我们自愿从数据中推断模式，而不是优化。

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

默认情况下，ClickHouse 会收集并记录每个执行的查询的信息，在 [查询日志](/operations/system-tables/query_log) 中。此数据存储在表 `system.query_log` 中。

对于每个执行的查询，ClickHouse 会记录统计信息，如查询执行时间、读取的行数和资源使用情况（如 CPU、内存使用率或文件系统缓存命中）。

因此，查询日志是调查慢查询的好地方。你可以轻松找出执行时间较长的查询，并显示每个查询的资源使用信息。

让我们找出 NYC 出租车数据集中执行时间最长的前五个查询。

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

字段 `query_duration_ms` 指示该特定查询执行所需的时间。从查询日志的结果来看，我们可以看到第一个查询的运行时间为 2967ms，这是可以改进的。

你可能还想知道哪些查询在给系统施压，可以通过检查消耗最多内存或 CPU 的查询来获知。

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

让我们隔离找到的长时间运行的查询，并重新运行它们几次，以了解响应时间。

此时，关闭文件系统缓存，通过将 `enable_filesystem_cache` 设置为 0，以提高可重复性是至关重要的。

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

| 名称    | 经过时间   | 处理的行数 | 峰值内存 |
| ------- | --------- | -------------- | ----------- |
| 查询 1 | 1.699 秒 | 3.2904 亿 | 440.24 MiB  |
| 查询 2 | 1.419 秒 | 3.2904 亿 | 546.75 MiB  |
| 查询 3 | 1.414 秒 | 3.2904 亿 | 451.53 MiB  |

让我们更好地理解这些查询的结果。

- 查询 1 计算以超出每小时 30 英里的平均速度进行的乘车距离分布。
- 查询 2 查找每周的乘车数量和平均费用。
- 查询 3 计算数据集中每次出行的平均时间。

这些查询都没有进行非常复杂的处理，除了第一个查询，每次查询执行时都计算出行时间。然而，这些查询的执行时间都超过了一秒，在 ClickHouse 的世界里，这是一个非常长的时间。我们还可以注意到这些查询的内存使用情况；每个查询的内存使用量大约是 400 Mb，这对于每个查询来说相当多。此外，每个查询似乎读取的行数相同（即 3.2904 亿）。让我们快速确认一下这个表中有多少行。

```sql
-- Count number of rows in table
SELECT count()
FROM nyc_taxi.trips_small_inferred

Query id: 733372c5-deaf-4719-94e3-261540933b23

   ┌───count()─┐
1. │ 329044175 │ -- 329.04 million
   └───────────┘
```

该表包含 3.2904 亿行，因此每个查询都在对整个表进行全表扫描。

### Explain 语句 {#explain-statement}

现在我们已经有了一些长时间运行的查询，让我们理解它们是如何执行的。为此，ClickHouse 支持 [EXPLAIN 语句命令](/sql-reference/statements/explain)。这是一个非常有用的工具，可以在不实际运行查询的情况下，提供所有查询执行阶段的详细视图。尽管对非 ClickHouse 专家来说，查看它可能让人感到不知所措，但它仍然是深入了解查询执行方式的基本工具。

文档提供了详细的 [指南](/guides/developer/understanding-query-execution-with-the-analyzer)，说明什么是 EXPLAIN 语句，以及如何使用它来分析查询执行。我们不再重复该指南中的内容，而是重点关注一些命令，它们将帮助我们找到查询执行性能中的瓶颈。

**Explain indexes = 1**

让我们首先使用 EXPLAIN indexes = 1 来检查查询计划。查询计划是一个树状结构，显示查询将如何执行。在这里，你可以看到查询中各个子句的执行顺序。EXPLAIN 语句返回的查询计划可以从下到上进行阅读。

让我们尝试使用我们长时间运行的查询中的第一个。

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

输出简单明了。查询首先从 `nyc_taxi.trips_small_inferred` 表中读取数据。然后，应用 WHERE 子句根据计算的值筛选行。过滤后的数据为聚合准备，最后计算分位数。最后，结果被排序并输出。

在这里，我们可以注意到没有使用主键，这也是合理的，因为我们在创建表时没有定义任何主键。因此，ClickHouse 在查询时需要对整个表进行全表扫描。

**Explain Pipeline**

EXPLAIN Pipeline 显示查询的具体执行策略。在这里，你可以看到 ClickHouse 实际执行我们之前查看的通用查询计划的方式。

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

在这里，我们可以注意到执行查询的线程数量为 59 个，表示高度并行。这加快了查询的速度，如果在较小的机器上执行可能会更长。并行运行的线程数量可以解释查询使用的高内存量。

理想情况下，你应以相同的方式调查所有的慢查询，以识别不必要的复杂查询计划，并了解每个查询读取的行数和消耗的资源。

## 方法论 {#methodology}

在生产环境中识别有问题的查询可能很困难，因为在你的 ClickHouse 部署中，可能会有大量的查询在任意时刻被执行。

如果你知道哪些用户、数据库或表存在问题，可以使用 `system.query_logs` 中的 `user`、`tables` 或 `databases` 字段来缩小范围。

一旦确认了你想要优化的查询，你可以开始对其进行优化。开发人员在这个阶段常犯的错误是同时更改多个内容，进行临时实验，通常会导致结果混合，最重要的是，缺乏对是什么使查询更快的良好理解。

查询优化需要结构。我不是说高级基准测试，而是设定一个简单的流程，以便理解更改如何影响查询性能，这可以大有帮助。

首先从查询日志中识别慢查询，然后在隔离下调查潜在的改进。在测试查询时，请确保禁用文件系统缓存。

> ClickHouse 利用 [缓存](/operations/caches) 在不同阶段加速查询性能。这对查询性能有好处，但在故障排除期间，它可能隐藏潜在的 I/O 瓶颈或不良的表模式。因此，我建议在测试期间关闭文件系统缓存。确保在生产环境中启用它。

一旦确定了潜在的优化，建议你逐个实施它们，以便更好地跟踪它们如何影响性能。下面是描述一般方法的图表。

<Image img={queryOptimizationDiagram1} size="lg" alt="优化工作流"/>

_最后，要小心异常值；查询可能缓慢运行很常见，这可能是由于用户尝试了临时费用高的查询或系统由于其他原因承受压力。你可以通过字段 normalized_query_hash 分组，以识别定期执行的高成本查询。这些查询可能是你需要调查的对象。_

## 基础优化 {#basic-optimization}

现在我们有了测试框架，可以开始优化。

开始的最好地方是看看数据的存储方式。对于任何数据库来说，我们读取的数据越少，查询执行的速度就越快。

根据你如何导入数据，你可能利用 ClickHouse 的 [能力](/interfaces/schema-inference) 根据导入的数据推断表模式。虽然这对于开始使用非常实用，但如果你想优化查询性能，就需要查看数据模式，以最佳方式适应你的用例。

### Nullable {#nullable}

如 [最佳实践文档](/best-practices/select-data-types#avoid-nullable-columns) 中所描述，尽可能避免使用 Nullable 列。虽然它们使数据导入机制更加灵活，但每次都必须处理额外的列，因而对性能产生负面影响。

运行一个计算 NULL 值行数的 SQL 查询，可以轻松揭示表中实际上需要 Nullable 值的列。

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

我们仅有两个列包含空值：`mta_tax` 和 `payment_type`。其余字段不应使用 `Nullable` 列。

### 低基数 {#low-cardinality}

对字符串应用的简单优化是充分利用 LowCardinality 数据类型。如 [低基数文档](/sql-reference/data-types/lowcardinality) 所述，ClickHouse 对 LowCardinality 列应用字典编码，显著提高查询性能。

确定哪些列是 LowCardinality 的良好候选者的一个简单经验法则是：任何唯一值少于 10,000 的列都是完美的候选者。

你可以使用以下 SQL 查询找到唯一值数量较少的列。

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

根据低基数，这四列 `ratecode_id`、`pickup_location_id`、`dropoff_location_id` 和 `vendor_id` 是 LowCardinality 字段类型的良好候选者。

### 优化数据类型 {#optimize-data-type}

ClickHouse 支持大量数据类型。确保选择适合用例的最小数据类型，以优化性能并减少磁盘上的数据存储空间。

对于数字，你可以检查数据集中最小/最大值，以查看当前精度值是否与数据集的实际情况匹配。

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

对于日期，您应该选择与数据集匹配的精度，并且最好适合于回答您计划运行的查询。

### 应用优化 {#apply-the-optimizations}

让我们创建一个新表，以使用优化后的模式并重新导入数据。

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

| 名称    | 运行 1 - 经过时间 | 经过时间   | 处理的行数 | 峰值内存 |
| ------- | --------------- | --------- | -------------- | ----------- |
| 查询 1 | 1.699 秒       | 1.353 秒 | 3.2904 亿 | 337.12 MiB  |
| 查询 2 | 1.419 秒       | 1.171 秒 | 3.2904 亿 | 531.09 MiB  |
| 查询 3 | 1.414 秒       | 1.188 秒 | 3.2904 亿 | 265.05 MiB  |

我们注意到查询时间和内存使用情况都有所改善。由于数据模式的优化，我们减少了代表我们数据的总数据量，从而改善了内存消耗并减少了处理时间。

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

新表比之前的表要小得多。我们看到表的磁盘空间减少了大约 34%（7.38 GiB 与 4.89 GiB）。

## 主键的重要性 {#the-importance-of-primary-keys}

ClickHouse 中的主键与大多数传统数据库系统的工作方式不同。在这些系统中，主键强制执行唯一性和数据完整性。任何试图插入重复主键值的尝试都会被拒绝，并且通常会创建基于 B 树或哈希的索引以实现快速查找。

在 ClickHouse 中，主键的 [目标](/guides/best-practices/sparse-primary-indexes#a-table-with-a-primary-key) 是不同的；它不强制唯一性或帮助维护数据完整性。相反，它旨在优化查询性能。主键定义了数据在磁盘上的存储顺序，并实现为稀疏索引，存储指向每个粒度第一个行的指针。

> 在 ClickHouse 中，粒度是查询执行期间读取的最小数据单元。它们包含最多固定数量的行，由 index_granularity 确定，默认值为 8192 行。粒度是连续存储并按主键排序的。

选择一组良好的主键对性能至关重要，实际上，常常会将相同的数据存储在不同的表中，并使用不同的主键组合以加速特定查询的执行。

ClickHouse 支持的其他选项，如 Projection 和物化视图，允许你对相同数据使用不同的主键组合。本系列博客的第二部分将对此进行更详细的讨论。

### 选择主键 {#choose-primary-keys}

选择正确的主键组合是一个复杂的话题，可能需要权衡和实验以找到最佳组合。

目前，我们将遵循以下简单做法：

- 使用大多数查询中用于过滤的字段
- 首先选择基数较低的列
- 考虑主键中的基于时间的组件，因为在时间戳数据集上按时间过滤是相当常见的。

在我们的案例中，我们将尝试以下主键：`passenger_count`、`pickup_datetime` 和 `dropoff_datetime`。

passenger_count 的基数很小（24 个唯一值），并且在我们缓慢查询中使用。我们还添加了时间戳字段（`pickup_datetime` 和 `dropoff_datetime`），因为它们通常可以被过滤。

创建一个新表，添加主键并重新导入数据。

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

然后，我们重新运行查询。我们将三次实验的结果汇总，以查看经过时间、处理的行数和内存消耗的改进。

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
      <td>经过时间</td>
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
      <td>经过时间</td>
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
      <td>经过时间</td>
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

我们可以在执行时间和内存使用上看到显著的改善。

查询 2 从主键中获益最多。让我们看看生成的查询计划与之前有什么不同。

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

凭借主键，仅选择了表粒度的子集。这本身就大大提高了查询性能，因为 ClickHouse 需要处理的数据量大幅减少。

## 下一步 {#next-steps}

希望本指南使您对如何使用 ClickHouse 调查慢查询以及如何使其更快有一个良好的理解。要深入探讨此主题，你可以阅读更多关于 [查询分析器](/operations/analyzer) 和 [分析](/operations/optimizing-performance/sampling-query-profiler) 以更好地理解 ClickHouse 是如何执行你的查询的。

随着你对 ClickHouse 特性越来越熟悉，我建议你阅读有关 [分区键](/optimize/partitioning-key) 和 [数据跳过索引](/optimize/skipping-indexes) 的内容，以了解更多可以加速查询的高级技术。
