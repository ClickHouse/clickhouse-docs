---
slug: /optimize/query-optimization
sidebar_label: 查询优化
title: 查询优化指南
description: 一个简单的查询优化指南，描述了提高查询性能的常见路径
---

import queryOptimizationDiagram1 from '@site/static/images/guides/best-practices/query_optimization_diagram_1.png';

# 一个简单的查询优化指南

本节旨在通过常见场景说明如何使用不同的性能和优化技术，比如 [分析工具](/operations/analyzer)、[查询分析](/operations/optimizing-performance/sampling-query-profiler) 或 [避免 Nullable 列](/optimize/avoid-nullable-columns)，来提高你的 ClickHouse 查询性能。
## 理解查询性能 {#understand-query-performance}

考虑性能优化的最佳时机是当你在首次将数据导入到 ClickHouse 之前设置 [数据模式](/data-modeling/schema-design) 时。

但是我们要诚实地说，预测你的数据会增长多少或将执行哪些类型的查询是很困难的。

如果你有一个现有的部署，想要改善几个查询，第一步是理解这些查询的性能以及为什么有些查询执行只需几毫秒而其他的则需要更长时间。

ClickHouse 拥有丰富的工具来帮助你理解查询是如何执行的，以及执行过程中消耗了多少资源。

在本节中，我们将探讨这些工具及其用法。
## 一般考量 {#general-considerations}

要理解查询性能，我们来看看 ClickHouse 在执行查询时发生了什么。

以下部分故意简化并采取了一些捷径；这里的目的是不让你淹没在细节中，而是让你迅速掌握基本概念。有关更多信息，你可以阅读 [查询分析器](/operations/analyzer)。

从一个很高的层面来看，当 ClickHouse 执行查询时，会发生以下几个步骤：

  - **查询解析与分析**

查询被解析和分析，生成一个通用的查询执行计划。

  - **查询优化**

查询执行计划被优化，不必要的数据被修剪，并从查询计划中构建查询管道。

  - **查询管道执行**

数据被并行读取和处理。这是 ClickHouse 实际执行查询操作（如过滤、聚合和排序）的阶段。

  - **最终处理**

结果被合并、排序并格式化为最终结果，然后发送给客户端。

实际上，许多 [优化](/concepts/why-clickhouse-is-so-fast) 正在进行中，我们将在本指南中进一步讨论它们，但现在，这些主要概念让我们对 ClickHouse 执行查询时幕后发生的事情有了很好的理解。

通过这样的高层理解，让我们来审视 ClickHouse 提供的工具，以及如何使用这些工具跟踪影响查询性能的指标。
## 数据集 {#dataset}

我们将使用一个实际示例来说明我们如何处理查询性能。

我们使用 NYC 出租车数据集，该数据集包含纽约市的出租车行程数据。首先，我们开始导入 NYC 出租车数据集，而不进行任何优化。

以下是创建表格并从 S3 桶中插入数据的命令。请注意，我们自愿从数据中推断模式，这并没有得到优化。

```sql
-- 创建推断模式的表
CREATE TABLE trips_small_inferred
ORDER BY () EMPTY
AS SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/clickhouse-academy/nyc_taxi_2009-2010.parquet');

-- 从推断模式的表中插入数据
INSERT INTO trips_small_inferred
SELECT * 
FROM s3Cluster
('default','https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/clickhouse-academy/nyc_taxi_2009-2010.parquet');
```

让我们查看一下自动从数据推断出的表模式。

```sql
--- 显示推断的表模式
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

默认情况下，ClickHouse 收集并记录有关每个执行查询的信息，存储在 [查询日志](/operations/system-tables/query_log) 中。此数据存储在 `system.query_log` 表中。

对于每个执行的查询，ClickHouse 记录统计信息，如查询执行时间、读取的行数，以及使用的资源，如 CPU、内存使用量或文件系统缓存命中。

因此，查询日志是调查慢查询的好地方。你可以轻松找到执行时间较长的查询，并为每个查询显示资源使用信息。

让我们找出在我们的 NYC 出租车数据集中运行时间最长的五个查询。

```sql
-- 查找过去 1 小时内来自 nyc_taxi 数据库的前 5 个长时间运行的查询
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

字段 `query_duration_ms` 指示特定查询执行所花费的时间。从查询日志的结果中，我们可以看到第一个查询花费了 2967 毫秒来运行，这可以得到改善。

你可能还想知道哪些查询正在给系统带来压力，通过检查消耗最多内存或 CPU 的查询。

```sql
-- 依据内存使用情况查找前查询 
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

让我们隔离我们找到的长时间运行的查询，并重新运行它们几次以了解响应时间。

此时，重要的是通过将 `enable_filesystem_cache` 设置为 0 来关闭文件系统缓存，以提高可重复性。

```sql
-- 禁用文件系统缓存
set enable_filesystem_cache = 0;

-- 运行查询 1
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

-- 运行查询 2
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

-- 运行查询 3
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

| 名称    | 消耗时间   | 处理行数 | 峰值内存 |
| ------- | --------- | -------------- | ----------- |
| 查询 1 | 1.699 sec | 329.04 million | 440.24 MiB  |
| 查询 2 | 1.419 sec | 329.04 million | 546.75 MiB  |
| 查询 3 | 1.414 sec | 329.04 million | 451.53 MiB  |

让我们更好地理解一下这些查询的作用。

-   查询 1 计算平均时速超过 30 英里每小时的行程距离分布。
-   查询 2 查找每周的行程数量和平均费用。
-   查询 3 计算数据集中每次行程的平均时间。

这些查询都没有进行非常复杂的处理，除了第一个查询在每次查询执行时都要动态计算行程时间。然而，以上这些查询都需要超过一秒的时间执行，这在 ClickHouse 的世界中是非常长的。我们还注意到这些查询的内存使用情况；每个查询约 400 MB 的内存相当可观。此外，每个查询似乎读取的行数都是相同的（即 329.04 million）。我们快速确认一下这个表中有多少行。

```sql
-- 计算表中的行数 
SELECT count()
FROM nyc_taxi.trips_small_inferred

Query id: 733372c5-deaf-4719-94e3-261540933b23

   ┌───count()─┐
1. │ 329044175 │ -- 329.04 million
   └───────────┘
```

该表包含 329.04 million 行，因此每个查询都在对表进行全面扫描。
### 解释语句 {#explain-statement}

现在我们有了一些长时间运行的查询，让我们了解它们是如何执行的。为此，ClickHouse 支持 [EXPLAIN语句命令](/sql-reference/statements/explain)。这是一个非常有用的工具，提供了查询执行的所有阶段的详细视图，而不实际运行查询。虽然对于非 ClickHouse 专家来说，这可能看起来很复杂，但它依然是深入了解查询如何执行的重要工具。

文档提供了详细的 [指南](/guides/developer/understanding-query-execution-with-the-analyzer)，介绍了 EXPLAIN 语句是什么，以及如何使用它来分析你的查询执行。我们不想重复这份指南的内容，而是将重点放在一些可以帮助我们找到查询执行性能瓶颈的命令上。

**解释索引 = 1**

让我们以 EXPLAIN indexes = 1 开始，检查查询计划。查询计划是一个树状图，展示了查询将如何执行。在这里，你可以看到查询中的子句将以何种顺序执行。由 EXPLAIN 语句返回的查询计划可以从下到上进行阅读。

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

输出内容很直观。查询首先从 `nyc_taxi.trips_small_inferred` 表中读取数据。然后，应用 WHERE 子句以基于计算值过滤行。过滤后的数据准备进行聚合，计算分位数。最后，结果被排序并输出。

在这里，我们可以注意到没有使用主键，这也是可以理解的，因为在创建表时我们并未定义任何主键。因此，ClickHouse 在执行查询时正在对表进行全面扫描。

**解释管道**

EXPLAIN PIPELINE 显示查询的具体执行策略。在这里，你可以看到 ClickHouse 实际执行我们之前查看的通用查询计划的方法。

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

在这里，我们注意到执行查询所使用的线程数量为 59，表明高度并行化。这加快了查询的速度，而在较小的机器上则需要更长的执行时间。并行运行的线程数量可以解释查询使用的高内存量。

理想情况下，你应该以相同的方式调查所有慢查询，以识别不必要的复杂查询计划，并了解每个查询读取行数和消耗的资源。
## 方法论 {#methodology}

在生产部署中识别问题查询可能很困难，因为在你的 ClickHouse 部署中，随时可能会执行大量查询。

如果你知道哪个用户、哪个数据库或哪个表有问题，可以使用 `system.query_logs` 中的 `user`、`tables` 或 `databases` 字段来缩小搜索范围。

一旦你识别出想要优化的查询，就可以开始着手进行优化。在这个阶段，开发者常犯的一个错误是同时更改多个内容，运行临时实验，通常会以混合结果结束，但更重要的是，缺乏对是什么使查询更快的良好理解。

查询优化需要结构。我不是在谈论高级基准测试，而是说建立一个简单的过程来理解你的更改如何影响查询性能将发挥很大作用。

首先通过查询日志识别慢查询，然后在隔离中调查潜在的改进。在测试查询时，确保禁用文件系统缓存。

> ClickHouse 利用 [缓存](/operations/caches) 在不同阶段加快查询性能。这对查询性能有好处，但在故障排除期间，它可能会掩盖潜在的 I/O 瓶颈或糟糕的表模式。因此，我建议在测试期间关闭文件系统缓存。确保在生产环境中启用它。

一旦你识别出潜在的优化，建议逐一实施它们，以便更好地跟踪它们对性能的影响。下面是描述一般方法的图示。

<img src={queryOptimizationDiagram1} class="image" />

_最后，小心异常值；查询缓慢的情况非常普遍，可能是因为用户尝试了临时的昂贵查询或系统因其他原因受到压力。你可以根据字段 normalized_query_hash 分组，以识别定期执行的昂贵查询。这些查询可能是你想调查的对象。_
## 基本优化 {#basic-optimization}

既然我们有了测试的框架，我们可以开始优化。

开始的最佳地方是查看数据如何存储。对于任何数据库，读取的数据越少，查询的执行就越快。

根据你如何导入数据，你可能利用了 ClickHouse [功能](/interfaces/schema-inference) 从导入数据中推断表模式。虽然这对于入门非常实用，但如果你想优化查询性能，你需要审查数据模式以最好地适应你的用例。
### Nullable {#nullable}

如 [最佳实践文档](/cloud/bestpractices/avoid-nullable-columns) 所述，尽可能避免 nullable 列。对它们的使用虽然诱人，因为它们使数据导入机制更加灵活，但它们会在每次处理时负面影响性能。

运行一个 SQL 查询以计算 NULL 值的行，可以轻松揭示出表中哪些列实际上需要 nullable 值。

```sql
-- 查找非空值列 
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

我们只有两列存在 null 值：`mta_tax` 和 `payment_type`。其他字段应该不使用 `Nullable` 列。
### 低基数 {#low-cardinality}

一个简单的优化应用于字符串，是最好利用低基数数据类型。正如低基数 [文档](/sql-reference/data-types/lowcardinality) 中所述，ClickHouse 对低基数列应用字典编码，这显著提高了查询性能。

确定哪些列适合低基数的简单规则是，任何唯一值少于 10,000 的列都是完美的候选。

您可以使用以下 SQL 查询查找唯一值较少的列。

```sql
-- 识别低基数列
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

由于基数较低，这四列 `ratecode_id`、`pickup_location_id`、`dropoff_location_id` 和 `vendor_id` 是低基数字段类型的良好候选。
### 优化数据类型 {#optimize-data-type}

Clickhouse 支持大量数据类型。选择适合用例的尽可能小的数据类型，以优化性能并减少磁盘上的数据存储空间。

对于数字，你可以检查数据集中最小/最大值，以确认当前精度值是否与数据集实际情况相匹配。

```sql
-- 查找 payment_type 字段的最小和最大值
SELECT
    min(payment_type),max(payment_type),
    min(passenger_count), max(passenger_count)
FROM trips_small_inferred

Query id: 4306a8e1-2a9c-4b06-97b4-4d902d2233eb

   ┌─min(payment_type)─┬─max(payment_type)─┐
1. │                 1 │                 4 │
   └───────────────────┴───────────────────┘
```

对于日期，你应该选择与数据集匹配的精度，并最好适合你打算运行的查询。
### 应用优化 {#apply-the-optimizations}

让我们创建一个使用优化模式的新表并重新导入数据。

```sql
-- 创建使用优化数据的表 
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

-- 插入数据 
INSERT INTO trips_small_no_pk SELECT * FROM trips_small_inferred
```

我们使用新表再次运行查询以检查改进。

| 名称    | 运行 1 - 消耗时间 | 消耗时间   | 处理行数 | 峰值内存 |
| ------- | --------------- | --------- | -------------- | ----------- |
| 查询 1 | 1.699 sec       | 1.353 sec | 329.04 million | 337.12 MiB  |
| 查询 2 | 1.419 sec       | 1.171 sec | 329.04 million | 531.09 MiB  |
| 查询 3 | 1.414 sec       | 1.188 sec | 329.04 million | 265.05 MiB  |

我们注意到查询时间和内存使用量都有了一些改进。通过对数据模式的优化，我们减少了表示数据的总数据量，导致内存消耗得到改善，处理时间降低。

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

我们看到新表的大小比之前的小得多。表的磁盘空间减少了约 34%（7.38 GiB 对 4.89 GiB）。
## 主键的重要性 {#the-importance-of-primary-keys}

ClickHouse 中的主键与大多数传统数据库系统的工作方式不同。在这些系统中，主键强制唯一性和数据完整性。任何尝试插入重复主键值的操作都将被拒绝，并且通常会创建 B 树或基于哈希的索引以进行快速查找。

在 ClickHouse 中，主键的 [目标](/guides/best-practices/sparse-primary-indexes#a-table-with-a-primary-key) 是不同的；它不会强制唯一性或帮助数据完整性。相反，其设计旨在优化查询性能。主键定义了数据在磁盘上的存储顺序，并实现为稀疏索引，存储指向每个颗粒的第一行的指针。

> 在 ClickHouse 中，颗粒是查询执行过程中读取的最小数据单位。它们包含固定数量的行，由 index_granularity 决定，默认值为 8192 行。颗粒被连续存储并按主键排序。

选择一组良好的主键对性能很重要，实际上常见的做法是将相同的数据存储在不同的表中，并使用不同的主键集来加速特定的查询集合。

ClickHouse 支持的其他选项，比如 Projections 或 Materialized views，允许你在相同的数据上使用不同的主键集。该系列博客的第二部分将对此进行更详细的探讨。
### 选择主键 {#choose-primary-keys}

选择正确的主键组合是一个复杂的话题，可能需要权衡和实验来找到最佳组合。

目前，我们将遵循以下简单的实践：

- 使用大多数查询中用于过滤的字段
- 优先选择低基数的列
- 考虑在主键中加入时间相关的组件，因为在时间戳数据集上按时间过滤是很常见的。

在我们的案例中，我们将尝试以下主键： `passenger_count`、`pickup_datetime` 和 `dropoff_datetime`。

`passenger_count`的基数较小（24个唯一值），且在我们的慢查询中使用。我们还添加了时间戳字段（`pickup_datetime` 和 `dropoff_datetime`），因为它们经常可以被过滤。

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

-- 插入数据 
INSERT INTO trips_small_pk SELECT * FROM trips_small_inferred
```

然后我们重新运行查询。我们汇总三个实验的结果以查看在消耗时间、处理行数和内存使用方面的改进。

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
      <td>处理行数</td>
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
      <td>处理行数</td>
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
      <td>处理行数</td>
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

我们可以看到在执行时间和使用内存方面都有显著改善。

查询 2 从主键中获益最多。让我们看看生成的查询计划与之前有何不同。

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
 1. │ 表达式 ((投影 + 在排序之前的 [提升部分]))                                                      │
 2. │   排序 (用于 ORDER BY 的排序)                                                                               │
 3. │     表达式 (在 ORDER BY 之前)                                                                               │
 4. │       聚合                                                                                                │
 5. │         表达式 (在 GROUP BY 之前)                                                                         │
 6. │           表达式                                                                                          │
 7. │             从 MergeTree 读取 (nyc_taxi.trips_small_pk)                                                 │
 8. │             索引:                                                                                          │
 9. │               主键                                                                                          │
10. │                 关键字:                                                                                     │
11. │                   pickup_datetime                                                                             │
12. │                 条件: and((pickup_datetime in (-Inf, 1238543999]), (pickup_datetime in [1230768000, +Inf))) │
13. │                 部件: 9/9                                                                                   │
14. │                 粒度: 5061/40167                                                                             │
    └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

感谢主键，只有一部分表粒度被选中。这本身大大提高了查询性能，因为 ClickHouse 处理的数据量显著减少。

## 下一步 {#next-steps}

希望本指南能帮助你理解如何使用 ClickHouse 调查慢查询以及如何加快它们的速度。要进一步探索这个主题，可以阅读更多关于 [查询分析器](/operations/analyzer) 和 [分析](/operations/optimizing-performance/sampling-query-profiler) 的内容，以更好地理解 ClickHouse 是如何执行你的查询的。

随着你对 ClickHouse 特性的逐渐熟悉，我建议阅读关于 [分区键](/optimize/partitioning-key) 和 [数据跳过索引](/optimize/skipping-indexes) 的内容，以了解更多你可以用来加速查询的高级技术。
