---
'slug': '/data-modeling/projections'
'title': '投影'
'description': '页面描述了什么是投影，它们如何用于提高查询性能，以及它们与物化视图的区别。'
'keywords':
- 'projection'
- 'projections'
- 'query optimization'
---

import projections_1 from '@site/static/images/data-modeling/projections_1.png';
import projections_2 from '@site/static/images/data-modeling/projections_2.png';
import Image from '@theme/IdealImage';


# Projections

## Introduction {#introduction}

ClickHouse 提供了多种机制来加速对大量数据的分析查询，以满足实时场景的需求。其中一种加速查询的机制是通过使用 _Projections_。Projections 通过按感兴趣的属性重新排序数据来帮助优化查询。这可以是：

1. 完整的重新排序
2. 原始表的不同顺序子集
3. 预计算的聚合（类似于物化视图），但订单与聚合对齐。

## How do Projections work? {#how-do-projections-work}

实际上，Projection 可以被视为原始表的额外隐藏表。投影可以具有与原始表不同的行顺序，因此具有不同的主键索引，并且可以自动增量地预计算聚合值。因此，使用 Projections 为加速查询执行提供了两个“调节旋钮”：

- **正确使用主键索引**
- **预计算聚合**

不同程度上，Projections 类似于 [Materialized Views](/materialized-views)，后者也允许您在插入时拥有多种行顺序和预计算聚合。Projections 会自动更新并与原始表保持同步，不同于需要显式更新的物化视图。当查询目标是原始表时，ClickHouse 会自动抽样主键并选择一个可以生成相同正确结果但要求读取的数据量最少的表，如下图所示：

<Image img={projections_1} size="lg" alt="Projections in ClickHouse"/>

## When to use Projections? {#when-to-use-projections}

Projections 是新用户一个非常吸引人的特性，因为它们在数据插入时会自动维护。此外，查询仅需发送到单个表，在可能的情况下利用 projections 来加速响应时间。

这与物化视图形成对比，后者用户需要根据过滤条件选择适当的优化目标表或重写他们的查询。这对用户应用程序的依赖性更大，并增加了客户端的复杂性。

尽管这些优点，projections 也有一些固有的限制，用户应该注意，因此应该谨慎使用。

- Projections 不允许为源表和（隐藏）目标表使用不同的 TTL，物化视图允许不同的 TTL。
- Projections 目前不支持 `optimize_read_in_order` 用于（隐藏）目标表。
- 对于带有 projections 的表，不支持轻量级更新和删除。
- 物化视图可以链接：一个物化视图的目标表可以是另一个物化视图的源表，等等。这在 projections 中不可行。
- Projections 不支持连接，但物化视图支持。
- Projections 不支持过滤器（`WHERE` 子句），而物化视图支持。

我们建议在以下情况下使用 projections：

- 需要对数据进行完整的重新排序。尽管投影中的表达式在理论上可以使用 `GROUP BY`，物化视图在维护聚合方面更为有效。查询优化器也更有可能利用使用简单重新排序的 projections，即 `SELECT * ORDER BY x`。用户可以在此表达式中选择一部分列以减少存储占用。
- 用户能接受与之相关的存储占用增加和两次写入数据的开销。测试插入速度的影响并 [评估存储开销](/data-compression/compression-in-clickhouse)。

## Examples {#examples}

### Filtering on columns which aren't in the primary key {#filtering-without-using-primary-keys}

在此示例中，我们将向您展示如何向表中添加一个投影。我们还将查看如何使用投影加速过滤在表的主键中不存在的列的查询。

在此示例中，我们将使用位于 [sql.clickhouse.com](https://sql.clickhouse.com/) 的纽约出租车数据集，该数据集按 `pickup_datetime` 排序。

让我们写一个简单的查询以查找乘客给司机小费超过 200 美元的所有行程 ID：

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

请注意，由于我们在 `ORDER BY` 中没有包含 `tip_amount` 进行过滤，ClickHouse 不得不进行全表扫描。让我们加速这个查询。

为了保留原始表和结果，我们将创建一个新表并使用 `INSERT INTO SELECT` 复制数据：

```sql
CREATE TABLE nyc_taxi.trips_with_projection AS nyc_taxi.trips;
INSERT INTO nyc_taxi.trips_with_projection SELECT * FROM nyc_taxi.trips;
```

要添加投影，我们使用 `ALTER TABLE` 语句与 `ADD PROJECTION` 语句：

```sql
ALTER TABLE nyc_taxi.trips_with_projection
ADD PROJECTION prj_tip_amount
(
    SELECT *
    ORDER BY tip_amount, dateDiff('minutes', pickup_datetime, dropoff_datetime)
)
```

添加投影后，有必要使用 `MATERIALIZE PROJECTION` 语句，以便数据按照上述指定查询的物理顺序重新写入：

```sql
ALTER TABLE nyc.trips_with_projection MATERIALIZE PROJECTION prj_tip_amount
```

现在我们已经添加了投影，让我们再次运行查询：

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips_with_projection WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

请注意，我们能够大幅减少查询时间，并且需要扫描的行数更少。

我们可以通过查询 `system.query_log` 表来确认我们的查询确实使用了我们制作的投影：

```sql
SELECT query, projections 
FROM system.query_log 
WHERE query_id='<query_id>'
```

```response
┌─query─────────────────────────────────────────────────────────────────────────┬─projections──────────────────────┐
│ SELECT                                                                       ↴│ ['default.trips.prj_tip_amount'] │
│↳  tip_amount,                                                                ↴│                                  │
│↳  trip_id,                                                                   ↴│                                  │
│↳  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min↴│                                  │
│↳FROM trips WHERE tip_amount > 200 AND trip_duration_min > 0                   │                                  │
└───────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────┘
```

### Using projections to speed up UK price paid queries {#using-projections-to-speed-up-UK-price-paid}

为了演示如何使用 projections 来加速查询性能，让我们看一个使用真实数据集的示例。在此示例中，我们将使用我们的 [UK Property Price Paid](https://clickhouse.com/docs/getting-started/example-datasets/uk-price-paid) 教程中的表，包含 3003 万行。这个数据集也可在我们的 [sql.clickhouse.com](https://sql.clickhouse.com/?query_id=6IDMHK3OMR1C97J6M9EUQS) 环境中获得。

如果您想查看该表是如何创建和插入数据的，您可以参考 ["The UK property prices dataset"](/getting-started/example-datasets/uk-price-paid) 页面。

我们可以在此数据集上运行两个简单的查询。第一个列出伦敦县中支付价格最高的县，而第二个计算这些县的平均价格：

```sql runnable
SELECT
  county,
  price
FROM uk.uk_price_paid
WHERE town = 'LONDON'
ORDER BY price DESC
LIMIT 3
```

```sql runnable
SELECT
    county,
    avg(price)
FROM uk.uk_price_paid
GROUP BY county
ORDER BY avg(price) DESC
LIMIT 3
```

请注意，尽管非常快，但由于在创建表时 `town` 和 `price` 都未包含在我们的 `ORDER BY` 语句中，这两个查询都发生了对 3003 万行的全表扫描：

```sql
CREATE TABLE uk.uk_price_paid
(
  ...
)
ENGINE = MergeTree
--highlight-next-line
ORDER BY (postcode1, postcode2, addr1, addr2);
```

让我们看看是否可以使用 projections 加速此查询。

为了保留原始表和结果，我们将创建一个新表并使用 `INSERT INTO SELECT` 复制数据：

```sql
CREATE TABLE uk.uk_price_paid_with_projections AS uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections SELECT * FROM uk.uk_price_paid;
```

我们创建并填充投影 `prj_oby_town_price`，它生成一个按城镇和价格排序的额外（隐藏）表，以优化列出特定城镇中支付最高价格的县的查询：

```sql
ALTER TABLE uk.uk_price_paid_with_projections
  (ADD PROJECTION prj_obj_town_price
  (
    SELECT *
    ORDER BY
        town,
        price
  ))
```

```sql
ALTER TABLE uk.uk_price_paid_with_projections
  (MATERIALIZE PROJECTION prj_obj_town_price)
SETTINGS mutations_sync = 1
```

[`mutations_sync`](/operations/settings/settings#mutations_sync) 设置用于强制同步执行。

我们创建并填充投影 `prj_gby_county`——一个额外的（隐藏）表，它以增量方式预计算所有现有 130 个英国县的 avg(price) 聚合值：

```sql
ALTER TABLE uk.uk_price_paid_with_projections
  (ADD PROJECTION prj_gby_county
  (
    SELECT
        county,
        avg(price)
    GROUP BY county
  ))
```
```sql
ALTER TABLE uk.uk_price_paid_with_projections
  (MATERIALIZE PROJECTION prj_gby_county)
SETTINGS mutations_sync = 1
```

:::note
如果在像上面的 `prj_gby_county` 投影中使用了 `GROUP BY` 子句，则（隐藏）表的底层存储引擎会变为 `AggregatingMergeTree`，所有聚合函数会转换为 `AggregateFunction`。这确保了正确的增量数据聚合。
:::

下图是主表 `uk_price_paid_with_projections` 及其两个投影的可视化：

<Image img={projections_2} size="lg" alt="Visualization of the main table uk_price_paid_with_projections and its two projections"/>

如果我们现在再次运行列出伦敦县中支付最高价格的三个查询，我们会看到查询性能的提高：

```sql runnable
SELECT
  county,
  price
FROM uk.uk_price_paid_with_projections
WHERE town = 'LONDON'
ORDER BY price DESC
LIMIT 3
```

同样，对于列出三个位于英国的价格支付最高的县的查询：

```sql runnable
SELECT
    county,
    avg(price)
FROM uk.uk_price_paid_with_projections
GROUP BY county
ORDER BY avg(price) DESC
LIMIT 3
```

请注意，这两个查询都指向原始表，并且在创建这两个投影之前，两个查询都导致进行了全表扫描（3003 万行完全从磁盘流式传输）。

同时，请注意，列出伦敦县中支付最高价格的查询正在流式传输 217 万行。当我们直接使用优化此查询的第二个表时，仅有 81920 行从磁盘流式传输。

这种差异的原因是，目前不支持上述提到的 `optimize_read_in_order` 优化用于 projections。

我们检查 `system.query_log` 表，看到 ClickHouse 自动使用了上述两个查询的两个投影（见下方的 projections 列）：

```sql
SELECT
  tables,
  query,
  query_duration_ms::String ||  ' ms' AS query_duration,
        formatReadableQuantity(read_rows) AS read_rows,
  projections
FROM clusterAllReplicas(default, system.query_log)
WHERE (type = 'QueryFinish') AND (tables = ['default.uk_price_paid_with_projections'])
ORDER BY initial_query_start_time DESC
  LIMIT 2
FORMAT Vertical
```

```response
Row 1:
──────
tables:         ['uk.uk_price_paid_with_projections']
query:          SELECT
    county,
    avg(price)
FROM uk_price_paid_with_projections
GROUP BY county
ORDER BY avg(price) DESC
LIMIT 3
query_duration: 5 ms
read_rows:      132.00
projections:    ['uk.uk_price_paid_with_projections.prj_gby_county']

Row 2:
──────
tables:         ['uk.uk_price_paid_with_projections']
query:          SELECT
  county,
  price
FROM uk_price_paid_with_projections
WHERE town = 'LONDON'
ORDER BY price DESC
LIMIT 3
SETTINGS log_queries=1
query_duration: 11 ms
read_rows:      2.29 million
projections:    ['uk.uk_price_paid_with_projections.prj_obj_town_price']

2 rows in set. Elapsed: 0.006 sec.
```

### Further examples {#further-examples}

以下示例使用相同的英国价格数据集，比较使用和不使用投影的查询。

为了保留原始表（及其性能），我们再次使用 `CREATE AS` 和 `INSERT INTO SELECT` 创建表的副本。

```sql
CREATE TABLE uk.uk_price_paid_with_projections_v2 AS uk.uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections_v2 SELECT * FROM uk.uk_price_paid;
```

#### Build a Projection {#build-projection}

让我们创建一个按 `toYear(date)`、`district` 和 `town` 维度进行聚合的投影：

```sql
ALTER TABLE uk.uk_price_paid_with_projections_v2
    ADD PROJECTION projection_by_year_district_town
    (
        SELECT
            toYear(date),
            district,
            town,
            avg(price),
            sum(price),
            count()
        GROUP BY
            toYear(date),
            district,
            town
    )
```

为现有数据填充投影。（在未物化的情况下，投影将仅为新插入的数据创建）：

```sql
ALTER TABLE uk.uk_price_paid_with_projections_v2
    MATERIALIZE PROJECTION projection_by_year_district_town
SETTINGS mutations_sync = 1
```

以下查询比较使用和不使用投影的性能。要禁用投影使用，我们使用设置 [`optimize_use_projections`](/operations/settings/settings#optimize_use_projections)，该设置默认启用。

#### Query 1. Average price per year {#average-price-projections}

```sql runnable
SELECT
    toYear(date) AS year,
    round(avg(price)) AS price,
    bar(price, 0, 1000000, 80)
FROM uk.uk_price_paid_with_projections_v2
GROUP BY year
ORDER BY year ASC
SETTINGS optimize_use_projections=0
```

```sql runnable
SELECT
    toYear(date) AS year,
    round(avg(price)) AS price,
    bar(price, 0, 1000000, 80)
FROM uk.uk_price_paid_with_projections_v2
GROUP BY year
ORDER BY year ASC

```
结果应该是相同的，但后者示例的性能更佳！


#### Query 2. Average price per year in London {#average-price-london-projections}

```sql runnable
SELECT
    toYear(date) AS year,
    round(avg(price)) AS price,
    bar(price, 0, 2000000, 100)
FROM uk.uk_price_paid_with_projections_v2
WHERE town = 'LONDON'
GROUP BY year
ORDER BY year ASC
SETTINGS optimize_use_projections=0
```


```sql runnable
SELECT
    toYear(date) AS year,
    round(avg(price)) AS price,
    bar(price, 0, 2000000, 100)
FROM uk.uk_price_paid_with_projections_v2
WHERE town = 'LONDON'
GROUP BY year
ORDER BY year ASC
```

#### Query 3. The most expensive neighborhoods {#most-expensive-neighborhoods-projections}

条件 (date >= '2020-01-01') 需要修改，以便与投影维度匹配 (`toYear(date) >= 2020`)：

```sql runnable
SELECT
    town,
    district,
    count() AS c,
    round(avg(price)) AS price,
    bar(price, 0, 5000000, 100)
FROM uk.uk_price_paid_with_projections_v2
WHERE toYear(date) >= 2020
GROUP BY
    town,
    district
HAVING c >= 100
ORDER BY price DESC
LIMIT 100
SETTINGS optimize_use_projections=0
```

```sql runnable
SELECT
    town,
    district,
    count() AS c,
    round(avg(price)) AS price,
    bar(price, 0, 5000000, 100)
FROM uk.uk_price_paid_with_projections_v2
WHERE toYear(date) >= 2020
GROUP BY
    town,
    district
HAVING c >= 100
ORDER BY price DESC
LIMIT 100
```

同样，结果是相同的，但注意第二个查询的查询性能有所改善。


## Related content {#related-content}
- [A Practical Introduction to Primary Indexes in ClickHouse](/guides/best-practices/sparse-primary-indexes#option-3-projections)
- [Materialized Views](/docs/materialized-views)
- [ALTER PROJECTION](/sql-reference/statements/alter/projection)
