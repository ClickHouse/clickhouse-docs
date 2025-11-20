---
slug: /optimize/query-optimization
sidebar_label: '查询优化'
title: '查询优化指南'
description: '一份简明的查询优化指南，介绍提升查询性能的常见方法'
doc_type: 'guide'
keywords: ['query optimization', 'performance', 'best practices', 'query tuning', 'efficiency']
---

import queryOptimizationDiagram1 from '@site/static/images/guides/best-practices/query_optimization_diagram_1.png';
import Image from '@theme/IdealImage';


# 查询优化简明指南

本节将通过常见场景演示如何使用不同的性能和优化技术，例如 [analyzer](/operations/analyzer)、[查询分析](/operations/optimizing-performance/sampling-query-profiler) 或 [避免使用 Nullable 列](/optimize/avoid-nullable-columns)，以提升 ClickHouse 查询性能。



## 理解查询性能 {#understand-query-performance}

考虑性能优化的最佳时机是在首次将数据导入 ClickHouse 之前设置[数据模式](/data-modeling/schema-design)时。

但坦率地说,很难预测数据会增长到什么规模,或者会执行哪些类型的查询。

如果您有一个现有部署,并希望改进其中的一些查询,第一步是了解这些查询的性能表现,以及为什么有些查询在几毫秒内就能完成,而另一些则需要更长时间。

ClickHouse 提供了一套丰富的工具来帮助您了解查询的执行方式以及执行过程中消耗的资源。

在本节中,我们将介绍这些工具及其使用方法。 


## 一般性考虑 {#general-considerations}

要理解查询性能,让我们先看看在 ClickHouse 中执行查询时会发生什么。

以下部分经过刻意简化并采用了一些简便方式;这里的目的不是让您陷入细节之中,而是帮助您快速掌握基本概念。如需更多信息,您可以阅读关于[查询分析器](/operations/analyzer)的内容。

从非常高层次的角度来看,当 ClickHouse 执行查询时,会发生以下过程:

- **查询解析和分析**

查询被解析和分析,并创建一个通用的查询执行计划。

- **查询优化**

查询执行计划被优化,不必要的数据被剪除,并从查询计划构建查询管道。

- **查询管道执行**

数据被并行读取和处理。这是 ClickHouse 实际执行查询操作(如过滤、聚合和排序)的阶段。

- **最终处理**

结果被合并、排序并格式化为最终结果,然后发送给客户端。

实际上,许多[优化](/concepts/why-clickhouse-is-so-fast)正在进行,我们将在本指南中进一步讨论它们,但目前这些主要概念已经让我们对 ClickHouse 执行查询时幕后发生的事情有了很好的理解。

有了这个高层次的理解,让我们来看看 ClickHouse 提供的工具以及如何使用它们来跟踪影响查询性能的指标。 


## 数据集 {#dataset}

我们将使用一个真实示例来说明如何处理查询性能问题。 

让我们使用 NYC Taxi 数据集,该数据集包含纽约市的出租车行程数据。首先,我们从导入未经优化的 NYC Taxi 数据集开始。

以下是创建表并从 S3 存储桶插入数据的命令。请注意,我们有意从数据中推断模式,这种方式并未经过优化。

```sql
-- 使用推断的模式创建表
CREATE TABLE trips_small_inferred
ORDER BY () EMPTY
AS SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/clickhouse-academy/nyc_taxi_2009-2010.parquet');

-- 将数据插入到使用推断模式的表中
INSERT INTO trips_small_inferred
SELECT *
FROM s3Cluster
('default','https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/clickhouse-academy/nyc_taxi_2009-2010.parquet');
```

让我们查看从数据中自动推断出的表模式。

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


## 识别慢查询 {#spot-the-slow-queries}

### 查询日志 {#query-logs}

默认情况下,ClickHouse 会在[查询日志](/operations/system-tables/query_log)中收集并记录每个已执行查询的信息。这些数据存储在 `system.query_log` 表中。 

对于每个已执行的查询,ClickHouse 会记录统计信息,例如查询执行时间、读取的行数以及资源使用情况,如 CPU、内存使用量或文件系统缓存命中次数。 

因此,查询日志是排查慢查询的理想起点。您可以轻松识别执行时间较长的查询,并查看每个查询的资源使用信息。 

让我们在 NYC 出租车数据集上查找执行时间最长的前五个查询。

```sql
-- 查找过去 1 小时内 nyc_taxi 数据库中执行时间最长的前 5 个查询
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

字段 `query_duration_ms` 表示该特定查询的执行时间。从查询日志的结果可以看出,第一个查询需要 2967 毫秒才能运行,存在优化空间。 

您可能还想通过检查消耗最多内存或 CPU 的查询来了解哪些查询对系统造成了压力。 


```sql
-- 按内存使用量排序的查询
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

让我们把已经找到的长耗时查询单独挑出来，多次重新执行，以便了解其响应时间。 

在这一阶段，务必通过将 `enable_filesystem_cache` 设置为 0 来关闭文件系统缓存，以提高结果的可复现性。

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
返回 1 行。耗时:1.699 秒。已处理 3.2904 亿行,8.88 GB(1.9372 亿行/秒,5.23 GB/秒)
峰值内存使用量:440.24 MiB。

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
返回 4 行。耗时:1.419 秒。已处理 3.2904 亿行,5.72 GB(2.3186 亿行/秒,4.03 GB/秒)
峰值内存使用量:546.75 MiB。

-- 运行查询 3
SELECT
  avg(dateDiff('s', pickup_datetime, dropoff_datetime))
FROM nyc_taxi.trips_small_inferred
WHERE passenger_count = 1 or passenger_count = 2
FORMAT JSON

---
返回 1 行。耗时:1.414 秒。已处理 3.2904 亿行,8.88 GB(2.3263 亿行/秒,6.28 GB/秒)
峰值内存使用量:451.53 MiB。
```

在表格中汇总，便于阅读。

| Name    | Elapsed   | Rows processed | Peak memory |
| ------- | --------- | -------------- | ----------- |
| Query 1 | 1.699 sec | 329.04 million | 440.24 MiB  |
| Query 2 | 1.419 sec | 329.04 million | 546.75 MiB  |
| Query 3 | 1.414 sec | 329.04 million | 451.53 MiB  |

我们来更具体地看一下这些查询分别实现了什么功能。 

* Query 1 计算平均时速超过 30 英里的行程的距离分布。
* Query 2 统计每周行程的数量及其平均费用。 
* Query 3 计算数据集中每次行程的平均耗时。

这些查询本身都没有进行非常复杂的处理，唯一的例外是第一个查询，它在每次执行时都会动态计算行程时间。不过，这些查询每一个的执行时间都超过一秒，而在 ClickHouse 的世界里，这已经算是非常长的时间了。我们还可以注意到这些查询的内存使用情况：每个查询大约 400 MiB 的内存占用已经相当可观。另外，每个查询似乎都读取了相同数量的行（即 3.2904 亿行）。我们来快速确认一下这个表中到底有多少行数据。

```sql
-- 统计表中的行数
SELECT count()
FROM nyc_taxi.trips_small_inferred
```


Query id: 733372c5-deaf-4719-94e3-261540933b23

┌───count()─┐

1. │ 329044175 │ -- 3.29 亿
   └───────────┘

````

该表包含 3.2904 亿行数据,因此每个查询都会执行全表扫描。

### EXPLAIN 语句 {#explain-statement}

现在我们有了一些长时间运行的查询,让我们来了解它们是如何执行的。为此,ClickHouse 支持 [EXPLAIN 语句命令](/sql-reference/statements/explain)。这是一个非常有用的工具,无需实际运行查询即可提供查询执行各个阶段的详细视图。虽然对于非 ClickHouse 专家来说,这些信息可能会让人感到难以理解,但它仍然是深入了解查询执行方式的重要工具。

文档提供了一份详细的[指南](/guides/developer/understanding-query-execution-with-the-analyzer),介绍了 EXPLAIN 语句的作用以及如何使用它来分析查询执行。我们不再重复该指南中的内容,而是重点介绍几个能够帮助我们找到查询执行性能瓶颈的命令。 

**EXPLAIN indexes = 1**

让我们从 EXPLAIN indexes = 1 开始检查查询计划。查询计划是一个树形结构,展示了查询将如何执行。在其中,您可以看到查询子句的执行顺序。EXPLAIN 语句返回的查询计划可以从下往上阅读。

让我们尝试使用第一个长时间运行的查询。

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
````

输出一目了然。查询首先从 `nyc_taxi.trips_small_inferred` 表中读取数据，然后应用 WHERE 子句，根据计算得到的值过滤行。过滤后的数据将用于聚合，并在此基础上计算分位数。最后，对结果进行排序并输出。 

在这里，我们可以注意到没有使用主键，这很合理，因为在创建表时我们并未定义任何主键。其结果是，ClickHouse 在执行该查询时对整张表进行了全表扫描。 

**Explain Pipeline**

EXPLAIN Pipeline 展示了该查询的具体执行策略。在这里，你可以看到 ClickHouse 实际是如何执行我们之前看到的通用查询计划的。

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


在这里，我们可以看到用于执行查询的线程数量：59 个线程，这表明具有很高的并行度。这样可以加快查询执行速度；在较小的机器上执行同样的查询会花费更长时间。并行运行的线程数量也可以解释查询使用的大量内存。 

理想情况下，你应当以同样的方式排查所有慢查询，以识别不必要的复杂查询计划，并了解每个查询读取的行数以及消耗的资源。



## 方法论 {#methodology}

在生产环境中识别有问题的查询可能比较困难,因为在任何给定时间,您的 ClickHouse 部署上可能正在执行大量查询。

如果您知道哪个用户、数据库或表存在问题,可以使用 `system.query_logs` 中的 `user`、`tables` 或 `databases` 字段来缩小搜索范围。

一旦确定了要优化的查询,就可以开始着手优化工作。开发人员在此阶段常犯的一个错误是同时更改多个内容、运行临时实验,通常会得到混杂的结果,但更重要的是,无法清楚地理解是什么使查询变快了。

查询优化需要系统化的方法。我说的不是高级基准测试,而是建立一个简单的流程来了解您的更改如何影响查询性能,这会大有帮助。

首先从查询日志中识别慢查询,然后逐个调查潜在的改进方案。在测试查询时,请确保禁用文件系统缓存。

> ClickHouse 利用[缓存](/operations/caches)在不同阶段加速查询性能。这对查询性能有利,但在故障排查期间,它可能会隐藏潜在的 I/O 瓶颈或不良的表结构设计。因此,我建议在测试期间关闭文件系统缓存。请确保在生产环境中启用它。

一旦确定了潜在的优化方案,建议您逐一实施,以便更好地跟踪它们对性能的影响。下图描述了一般方法。

<Image img={queryOptimizationDiagram1} size='lg' alt='优化工作流程' />

_最后,要注意异常值;查询运行缓慢是很常见的情况,可能是因为用户尝试了临时的高开销查询,或者系统因其他原因处于压力之下。您可以按 normalized_query_hash 字段分组,以识别定期执行的高开销查询。这些可能是您需要重点调查的查询。_


## 基础优化 {#basic-optimization}

现在我们已经有了测试框架,可以开始优化了。

最好的起点是查看数据的存储方式。对于任何数据库而言,读取的数据越少,查询执行速度就越快。

根据您导入数据的方式,您可能已经利用了 ClickHouse 的[功能](/interfaces/schema-inference)来基于导入的数据推断表结构。虽然这对于快速上手非常实用,但如果您想优化查询性能,则需要审查数据结构以最适合您的使用场景。

### 可空类型 {#nullable}

如[最佳实践文档](/best-practices/select-data-types#avoid-nullable-columns)中所述,应尽可能避免使用可空列。虽然使用可空列很有吸引力,因为它们使数据导入机制更加灵活,但它们会对性能产生负面影响,因为每次都必须处理一个额外的列。

运行一个统计具有 NULL 值的行数的 SQL 查询,可以轻松找出表中实际需要可空值的列。

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

我们只有两列具有空值:`mta_tax` 和 `payment_type`。其余字段不应使用 `Nullable` 列。

### 低基数 {#low-cardinality}

应用于字符串的一个简单优化是充分利用 LowCardinality 数据类型。如低基数[文档](/sql-reference/data-types/lowcardinality)中所述,ClickHouse 对 LowCardinality 列应用字典编码,这显著提高了查询性能。

确定哪些列适合使用 LowCardinality 的一个简单经验法则是:任何唯一值少于 10,000 个的列都是理想的候选列。

您可以使用以下 SQL 查询来查找唯一值数量较少的列。

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

由于基数较低,这四列 `ratecode_id`、`pickup_location_id`、`dropoff_location_id` 和 `vendor_id` 是 LowCardinality 字段类型的良好候选列。

### 优化数据类型 {#optimize-data-type}

ClickHouse 支持大量数据类型。确保选择适合您使用场景的最小数据类型,以优化性能并减少磁盘上的数据存储空间。

对于数字类型,您可以检查数据集中的最小值/最大值,以确认当前精度值是否与数据集的实际情况相符。 


```sql
-- 查找 payment_type 字段的最小值/最大值
SELECT
    min(payment_type),max(payment_type),
    min(passenger_count), max(passenger_count)
FROM trips_small_inferred

Query id: 4306a8e1-2a9c-4b06-97b4-4d902d2233eb

   ┌─min(payment_type)─┬─max(payment_type)─┐
1. │                 1 │                 4 │
   └───────────────────┴───────────────────┘
```

对于日期类型,应选择与数据集相匹配的精度,以便最好地满足您计划运行的查询需求。

### 应用优化 {#apply-the-optimizations}

下面创建一个新表来使用优化后的模式,并重新导入数据。

```sql
-- 使用优化后的数据创建表
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

使用新表再次运行查询以检查性能改进情况。 

| Name    | Run 1 - Elapsed | Elapsed   | Rows processed | Peak memory |
| ------- | --------------- | --------- | -------------- | ----------- |
| Query 1 | 1.699 sec       | 1.353 sec | 329.04 million | 337.12 MiB  |
| Query 2 | 1.419 sec       | 1.171 sec | 329.04 million | 531.09 MiB  |
| Query 3 | 1.414 sec       | 1.188 sec | 329.04 million | 265.05 MiB  |

可以看到查询时间和内存使用均有所改善。通过优化数据模式,减少了数据的总体积,从而降低了内存消耗并缩短了处理时间。 

下面检查表的大小以查看差异。 

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

新表比原表小得多。可以看到表的磁盘空间减少了约 34%(从 7.38 GiB 降至 4.89 GiB)。


## 主键的重要性 {#the-importance-of-primary-keys}

ClickHouse 中的主键与大多数传统数据库系统的工作方式不同。在传统系统中,主键用于强制唯一性和数据完整性。任何插入重复主键值的尝试都会被拒绝,并且通常会创建基于 B 树或哈希的索引以实现快速查找。 

在 ClickHouse 中,主键的[目标](/guides/best-practices/sparse-primary-indexes#a-table-with-a-primary-key)有所不同;它不强制唯一性,也不用于维护数据完整性。相反,它旨在优化查询性能。主键定义了数据在磁盘上的存储顺序,并实现为一个稀疏索引,该索引存储指向每个数据粒度(granule)第一行的指针。

> ClickHouse 中的数据粒度(Granule)是查询执行期间读取的最小数据单元。它们包含固定数量的行,由 index_granularity 参数确定,默认值为 8192 行。数据粒度连续存储并按主键排序。 

选择一组合适的主键对性能至关重要,实际上,将相同的数据存储在不同的表中并使用不同的主键集来加速特定查询集是很常见的做法。 

ClickHouse 支持的其他选项,如投影(Projection)或物化视图(Materialized View),允许您在相同数据上使用不同的主键集。本系列博客的第二部分将更详细地介绍这一点。 

### 选择主键 {#choose-primary-keys}

选择正确的主键集是一个复杂的话题,可能需要权衡和实验才能找到最佳组合。 

目前,我们将遵循以下简单的实践原则: 

- 使用在大多数查询中用于过滤的字段
- 优先选择基数较低的列
- 考虑在主键中包含基于时间的组件,因为在时间戳数据集上按时间过滤是非常常见的。 

在我们的案例中,我们将使用以下主键进行实验:`passenger_count`、`pickup_datetime` 和 `dropoff_datetime`。 

passenger_count 的基数较小(24 个唯一值)并且在我们的慢查询中使用。我们还添加了时间戳字段(`pickup_datetime` 和 `dropoff_datetime`),因为它们经常被用于过滤。

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

然后我们重新运行查询。我们汇总三次实验的结果,以查看在执行时间、处理行数和内存消耗方面的改进。 

<table>
  <thead>
    <tr>
      <th colspan='4'>查询 1</th>
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
      <td>执行时间</td>
      <td>1.699 sec</td>
      <td>1.353 sec</td>
      <td>0.765 sec</td>
    </tr>
    <tr>
      <td>处理行数</td>
      <td>329.04 million</td>
      <td>329.04 million</td>
      <td>329.04 million</td>
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
      <th />

      <th>第 1 次运行</th>
      <th>第 2 次运行</th>
      <th>第 3 次运行</th>
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
      <td>已处理行数</td>
      <td>3.2904 亿</td>
      <td>3.2904 亿</td>
      <td>0.4146 亿</td>
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
      <th />

      <th>第 1 次运行</th>
      <th>第 2 次运行</th>
      <th>第 3 次运行</th>
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
      <td>已处理行数</td>
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

可以看到，在执行时间和内存使用方面整体上都有显著提升。

查询 2 从主键中获益最大。我们来看一下现在生成的查询计划与之前有什么不同。

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

查询 ID: 30116a77-ba86-4e9f-a9a2-a01670ad2e15

    ┌─explain──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 1. │ 表达式 ((投影 + ORDER BY 之前 [提升部分]))                                                                        │
 2. │   排序 (ORDER BY 排序)                                                                                           │
 3. │     表达式 (ORDER BY 之前)                                                                                       │
 4. │       聚合                                                                                                       │
 5. │         表达式 (GROUP BY 之前)                                                                                   │
 6. │           表达式                                                                                                 │
 7. │             ReadFromMergeTree (nyc_taxi.trips_small_pk)                                                          │
 8. │             索引:                                                                                                │
 9. │               主键                                                                                               │
10. │                 键:                                                                                              │
11. │                   pickup_datetime                                                                                │
12. │                 条件: and((pickup_datetime in (-Inf, 1238543999]), (pickup_datetime in [1230768000, +Inf)))     │
13. │                 分区: 9/9                                                                                        │
14. │                 颗粒: 5061/40167                                                                                 │
    └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

得益于主键，只选择了表中一部分数据粒度（granule）。仅此就能大幅提升查询性能，因为 ClickHouse 需要处理的数据量显著减少。


## 后续步骤 {#next-steps}

希望本指南能够帮助您深入理解如何使用 ClickHouse 诊断慢查询并提升其性能。要进一步探索此主题,您可以阅读有关[查询分析器](/operations/analyzer)和[性能分析](/operations/optimizing-performance/sampling-query-profiler)的更多内容,以更好地理解 ClickHouse 执行查询的具体机制。

随着您对 ClickHouse 特性的深入了解,建议您阅读有关[分区键](/optimize/partitioning-key)和[数据跳过索引](/optimize/skipping-indexes)的内容,以掌握更多可用于加速查询的高级技术。
