import projections_1 from '@site/static/images/data-modeling/projections_1.png';
import projections_2 from '@site/static/images/data-modeling/projections_2.png';
import Image from '@theme/IdealImage';

# Projections

## 介绍 {#introduction}

ClickHouse 提供了多种机制来加速对大量数据的分析查询，以满足实时场景的需求。其中一种加速查询的机制是使用 _Projections_。Projections 可以通过按感兴趣的属性重新排序数据来优化查询。这可以是：

1. 完整的重新排序
2. 具有不同顺序的原始表的子集
3. 预计算的聚合（类似于物化视图），但其排序与聚合对齐。

## Projections 是如何工作的？ {#how-do-projections-work}

实际上，Projection 可以被视为原始表的一个附加隐式表。该投影可以有不同的行顺序，因此可以具有与原始表不同的主键索引，并且可以自动和增量地预计算聚合值。因此，使用 Projections 可以提供两个“调节旋钮”来加速查询执行：

- **正确使用主键索引**
- **预计算聚合**

Projections 在某种程度上类似于 [Materialized Views](/materialized-views)，后者也允许您在插入时具有多个行顺序并预计算聚合。Projections 会自动更新并与原始表保持同步，而 Materialized Views 则需要显式更新。当查询目标是原始表时，ClickHouse 会自动采样主键，并选择一个可以生成相同正确结果的表，但需要读取的数据量最少，如下图所示：

<Image img={projections_1} size="lg" alt="ClickHouse 中的 Projections"/>

## 何时使用 Projections？ {#when-to-use-projections}

Projections 是新用户非常值得关注的特点，因为它们在数据插入时会自动维护。此外，查询可以只发送到一个表，在可能的情况下通过利用 Projections 来加速响应时间。

这与 Materialized Views 相对立，在 Materialized Views 中，用户必须根据过滤条件选择适当的优化目标表或重写查询。这对用户应用程序的要求更高，并增加了客户端的复杂性。

尽管有这些优势，Projections 也存在一些固有的限制，用户应当注意，并应谨慎使用。

- Projections 不允许对源表和（隐式）目标表使用不同的 TTL，而物化视图允许不同的 TTL。
- Projections 当前不支持 `optimize_read_in_order` 用于（隐式）目标表。
- 对于具有 Projections 的表，不支持轻量级更新和删除。
- 物化视图可以链接：一个物化视图的目标表可以是另一个物化视图的源表，依此类推。而这在 Projections 中则无法实现。
- Projections 不支持联接，但物化视图支持。
- Projections 不支持过滤器（`WHERE` 子句），但物化视图支持。

我们建议在以下情况下使用 Projections：

- 需要对数据进行完整重新排序时。虽然投影中的表达式理论上可以使用 `GROUP BY`，但物化视图在维护聚合时更为有效。查询优化器也更可能利用使用简单重新排序的 Projections，即 `SELECT * ORDER BY x`。用户可以在该表达式中选择列的子集以减少存储占用。
- 用户对相关存储占用的增加和双重写入数据的开销感到满意。测试插入速度的影响并 [评估存储开销](/data-compression/compression-in-clickhouse)。

## 示例 {#examples}

### 在未使用主键的情况下对列进行过滤 {#filtering-without-using-primary-keys}

在这个例子中，我们将展示如何向表中添加一个投影。我们还将看看如何使用该投影加速对未在表的主键中的列的过滤查询。

对于这个例子，我们将使用 New York Taxi Data 数据集，该数据集可以在 [sql.clickhouse.com](https://sql.clickhouse.com/) 获取，并按 `pickup_datetime` 排序。

让我们写一个简单查询，以查找所有乘客小费超过 $200 的行程 ID：

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

请注意，由于我们在 `tip_amount` 上进行过滤，而该列不在 `ORDER BY` 中，因此 ClickHouse 必须执行全表扫描。让我们加速这个查询。

为了保留原始表和结果，我们将创建一个新表并使用 `INSERT INTO SELECT` 复制数据：

```sql
CREATE TABLE nyc_taxi.trips_with_projection AS nyc_taxi.trips;
INSERT INTO nyc_taxi.trips_with_projection SELECT * FROM nyc_taxi.trips;
```

要添加投影，我们使用 `ALTER TABLE` 语句和 `ADD PROJECTION` 语句：

```sql
ALTER TABLE nyc_taxi.trips_with_projection
ADD PROJECTION prj_tip_amount
(
    SELECT *
    ORDER BY tip_amount, dateDiff('minutes', pickup_datetime, dropoff_datetime)
)
```

在添加投影后，必须使用 `MATERIALIZE PROJECTION` 语句，这样其中的数据就会根据上面指定的查询物理排序并重写：

```sql
ALTER TABLE nyc.trips_with_projection MATERIALIZE PROJECTION prj_tip_amount
```

现在让我们再次运行查询，看看我们添加了投影后会有什么变化：

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips_with_projection WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

请注意，我们能够显著减少查询时间，并且需要扫描的行数更少。

我们可以通过查询 `system.query_log` 表确认我们的查询确实使用了我们创建的投影：

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

### 使用 Projections 加速英国价格查询 {#using-projections-to-speed-up-UK-price-paid}

为了演示如何使用 Projections 来加速查询性能，让我们看看一个使用实际数据集的示例。在这个例子中，我们将使用来自我们 [UK Property Price Paid](https://clickhouse.com/docs/getting-started/example-datasets/uk-price-paid) 教程的表，该表包含 3003 万行。该数据集也可在我们的 [sql.clickhouse.com](https://sql.clickhouse.com/?query_id=6IDMHK3OMR1C97J6M9EUQS) 环境中获得。

如果您想查看表是如何创建和插入数据的，可以参考 ["英国房地产价格数据集"](/getting-started/example-datasets/uk-price-paid) 页面。

我们可以对该数据集运行两个简单的查询。第一个查询列出伦敦的县，按照支付的最高价格排序，第二个查询计算各县的平均价格：

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

请注意，尽管查询非常快速，但由于 `town` 和 `price` 都不在我们创建表时的 `ORDER BY` 语句中，因此两个查询都发生了全表扫描，涉及所有 3003 万行：

```sql
CREATE TABLE uk.uk_price_paid
(
  ...
)
ENGINE = MergeTree
--highlight-next-line
ORDER BY (postcode1, postcode2, addr1, addr2);
```

让我们看看是否可以通过 Projections 来加速这个查询。

为了保留原始表和结果，我们将创建一个新表并使用 `INSERT INTO SELECT` 复制数据：

```sql
CREATE TABLE uk.uk_price_paid_with_projections AS uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections SELECT * FROM uk.uk_price_paid;
```

我们创建并填充投影 `prj_oby_town_price`，它生成一个额外（隐式）表，主键按城镇和价格排序，以优化列出特定城镇中支付价格最高的县的查询：

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

我们创建并填充投影 `prj_gby_county` – 另一个（隐式）表，增量地预计算所有现有 130 个英国县的 avg(price) 聚合值：

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
如果在像上面的 `prj_gby_county` 投影中使用了 `GROUP BY` 子句，则（隐式）表的底层存储引擎将变为 `AggregatingMergeTree`，所有聚合函数将被转换为 `AggregateFunction`。这确保了适当的增量数据聚合。
:::

下图是主要表 `uk_price_paid_with_projections` 及其两个投影的可视化：

<Image img={projections_2} size="lg" alt="主要表 uk_price_paid_with_projections 及其两个投影的可视化"/>

如果我们现在再次运行列出伦敦县的三个支付价格最高的查询，我们会看到查询性能有所提高：

```sql runnable
SELECT
  county,
  price
FROM uk.uk_price_paid_with_projections
WHERE town = 'LONDON'
ORDER BY price DESC
LIMIT 3
```

同样，对于列出英国县中三个支付价格最高的查询：

```sql runnable
SELECT
    county,
    avg(price)
FROM uk.uk_price_paid_with_projections
GROUP BY county
ORDER BY avg(price) DESC
LIMIT 3
```

请注意，这两个查询均以原始表为目标，并且在创建两个投影之前，这两个查询都进行了全表扫描（所有 3003 万行都从磁盘提取）。

此外，请注意，列出伦敦县三个支付价格最高的查询流传输了 217 万行。当我们直接使用一个为该查询优化的第二个表时，仅流传输了 81.92 千行。

导致差异的原因是目前没有为 Projections 支持上面提到的 `optimize_read_in_order` 优化。

我们检查 `system.query_log` 表，发现 ClickHouse 自动为上述两个查询使用了两个投影（见下方的 projections 列）：

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

### 更多示例 {#further-examples}

以下示例使用相同的英国价格数据集，用于对比有和没有 Projections 的查询。

为了保留我们的原始表（及其性能），我们再创建一个表的副本，使用 `CREATE AS` 和 `INSERT INTO SELECT`。

```sql
CREATE TABLE uk.uk_price_paid_with_projections_v2 AS uk.uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections_v2 SELECT * FROM uk.uk_price_paid;
```

#### 构建投影 {#build-projection}

让我们按维度 `toYear(date)`、`district` 和 `town` 创建一个聚合投影：

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

为现有数据填充投影。（如果不物化，它将仅为新插入的数据创建投影）：

```sql
ALTER TABLE uk.uk_price_paid_with_projections_v2
    MATERIALIZE PROJECTION projection_by_year_district_town
SETTINGS mutations_sync = 1
```

以下查询对比使用和不使用 Projections 的性能。要禁用投影使用，我们使用设置 [`optimize_use_projections`](/operations/settings/settings#optimize_use_projections)，该设置默认启用。

#### 查询 1. 每年的平均价格 {#average-price-projections}

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
结果应该是相同的，但后一个示例的性能更好！


#### 查询 2. 伦敦每年的平均价格 {#average-price-london-projections}

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

#### 查询 3. 最昂贵的社区 {#most-expensive-neighborhoods-projections}

条件 (date >= '2020-01-01') 需要修改，以使其匹配投影维度 (`toYear(date) >= 2020`)：

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

再次，结果是相同的，但请注意第二个查询的查询性能有所改善。


## 相关内容 {#related-content}
- [ClickHouse 中主键的实用介绍](/guides/best-practices/sparse-primary-indexes#option-3-projections)
- [物化视图](/docs/materialized-views)
- [ALTER PROJECTION](/sql-reference/statements/alter/projection)
