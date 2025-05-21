---
'slug': '/data-modeling/projections'
'title': '投影'
'description': '描述了什么是投影，它们如何用于提高查询性能，以及它们与物化视图的区别。'
'keywords':
- 'projection'
- 'projections'
- 'query optimization'
---

import projections_1 from '@site/static/images/data-modeling/projections_1.png';
import projections_2 from '@site/static/images/data-modeling/projections_2.png';
import Image from '@theme/IdealImage';


# 投影

## 介绍 {#introduction}

ClickHouse 提供了多种加速大量数据的分析查询机制，旨在实时场景中使用。加速查询的一种机制是通过使用 _投影_。投影通过根据感兴趣的属性重新排序数据来帮助优化查询。这可以是：

1. 完全的重新排序
2. 原始表的一个子集，顺序不同
3. 预计算的聚合（类似于物化视图），但其顺序与聚合对齐。

## 投影如何工作？ {#how-do-projections-work}

实际上，投影可以被视为原始表的一个额外的、隐藏的表。投影可以具有不同的行顺序，因此具有与原始表不同的主键索引，同时它可以自动和增量地预计算聚合值。因此，使用投影提供了两个“调优旋钮”来加速查询执行：

- **正确使用主索引**
- **预计算聚合**

投影在某些方面类似于 [物化视图](/materialized-views)，后者也允许您在插入时拥有多种行顺序和预计算聚合。投影会自动更新，并与原始表保持同步，而物化视图则需要显式更新。当查询针对原始表时，ClickHouse 会自动采样主键，并选择一个能够生成相同正确结果的表，但要求读取的最少数据，如下图所示：

<Image img={projections_1} size="lg" alt="ClickHouse 中的投影"/>

## 何时使用投影？ {#when-to-use-projections}

由于投影在数据插入时会自动维护，因此对于新用户来说是一个具有吸引力的功能。此外，查询可以仅发送到一个表，在可能的情况下利用投影来加速响应时间。

这与物化视图形成对比，用户必须根据过滤条件选择合适的优化目标表或重写查询。这更加强调用户应用程序，并增加了客户端的复杂性。

尽管有这些优点，投影也存在一些固有的限制，用户应该意识到，并因此应谨慎使用。

- 投影不允许源表和（隐藏）目标表使用不同的生存时间（TTL），而物化视图允许不同的 TTL。
- 投影目前不支持 `optimize_read_in_order` 用于（隐藏的）目标表。
- 不支持轻量级更新和删除用于具有投影的表。
- 物化视图可以链接：一个物化视图的目标表可以成为另一个物化视图的源表，依此类推。但这种在投影中是不可能的。
- 投影不支持连接，但物化视图支持。
- 投影不支持过滤（`WHERE` 子句），而物化视图支持。

我们建议在以下情况下使用投影：

- 需要对数据进行完全重新排序。尽管理论上投影中的表达式可以使用 `GROUP BY`，但物化视图在维护聚合方面更有效。查询优化器也更可能利用使用简单重新排序的投影，即 `SELECT * ORDER BY x`。用户可以在该表达式中选择一个列子集，以减少存储占用。
- 用户对存储占用和双重写入数据的相关增加感到满意。测试插入速度的影响并 [评估存储开销](/data-compression/compression-in-clickhouse)。

## 示例 {#examples}

### 针对未在主键中的列进行筛选 {#filtering-without-using-primary-keys}

在这个例子中，我们将向您展示如何向表中添加投影。我们还将看看如何使用投影来加速针对未在表的主键中的列进行筛选的查询。

对于此示例，我们将使用在 [sql.clickhouse.com](https://sql.clickhouse.com/) 上可用的纽约出租车数据集，该数据集按 `pickup_datetime` 排序。

让我们编写一个简单的查询，以查找乘客给司机小费超过 $200 的所有旅行 ID：

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

请注意，因为我们在 `tip_amount` 上进行筛选，但该列不在 `ORDER BY` 中，因此 ClickHouse 必须进行全表扫描。让我们加速这个查询。

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

在添加投影之后，使用 `MATERIALIZE PROJECTION` 语句是必要的，以便将其中的数据根据上述指定的查询物理排序和重写：

```sql
ALTER TABLE nyc.trips_with_projection MATERIALIZE PROJECTION prj_tip_amount
```

现在我们添加了投影，让我们再次运行查询：

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips_with_projection WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

注意到我们能够显著减少查询时间，而且需要扫描更少的行。

我们可以通过查询 `system.query_log` 表确认我们上面的查询确实使用了我们制作的投影：

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

### 使用投影来加速英国价格查询 {#using-projections-to-speed-up-UK-price-paid}

为了演示 how 投影可以用来加速查询性能，我们来看一个使用现实生活数据集的例子。在此示例中，我们将使用来自我们 [英国房地产价格查询](https://clickhouse.com/docs/getting-started/example-datasets/uk-price-paid) 教程的表，拥有 3003 万行。该数据集也可以在我们的 [sql.clickhouse.com](https://sql.clickhouse.com/?query_id=6IDMHK3OMR1C97J6M9EUQS) 环境中找到。

如果您想查看如何创建表和插入数据，您可以参考 ["英国房地产价格数据集"](/getting-started/example-datasets/uk-price-paid) 页面。

我们可以在此数据集上执行两个简单的查询。第一个查询列出伦敦中支付价格最高的县，第二个查询计算各县的平均价格：

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

请注意，尽管查询非常快速，但由于在创建表时 `town` 和 `price` 都未在 `ORDER BY` 语句中，因此两个查询都进行了全表扫描（全部 3003 万行）。

```sql
CREATE TABLE uk.uk_price_paid
(
  ...
)
ENGINE = MergeTree
--highlight-next-line
ORDER BY (postcode1, postcode2, addr1, addr2);
```

让我们看看能否通过使用投影来加速此查询。

为了保留原始表和结果，我们将创建一个新表并使用 `INSERT INTO SELECT` 复制数据：

```sql
CREATE TABLE uk.uk_price_paid_with_projections AS uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections SELECT * FROM uk.uk_price_paid;
```

我们创建并填充投影 `prj_oby_town_price`，生成一个附加的（隐藏）表，使用主键按城镇和价格排序，以优化列出特定城镇的最高支付价格的查询：

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

我们创建并填充投影 `prj_gby_county`——一个附加的（隐藏）表，增量预计算所有现有 130 个英国县的 avg(price) 聚合值：

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
如果在投影中使用了 `GROUP BY` 子句，如上面的 `prj_gby_county` 投影，则该（隐藏）表的底层存储引擎将变为 `AggregatingMergeTree`，所有聚合函数被转换为 `AggregateFunction`。这确保了适当的增量数据聚合。
:::

下图是主表 `uk_price_paid_with_projections` 及其两个投影的可视化：

<Image img={projections_2} size="lg" alt="主表 uk_price_paid_with_projections 及其两个投影的可视化"/>

如果我们现在再次运行列出伦敦中支付价格最高的县的查询，我们会看到查询性能得到了提升：

```sql runnable
SELECT
  county,
  price
FROM uk.uk_price_paid_with_projections
WHERE town = 'LONDON'
ORDER BY price DESC
LIMIT 3
```

同样，对于列出英国各县中平均支付价格最高的三个县的查询：

```sql runnable
SELECT
    county,
    avg(price)
FROM uk.uk_price_paid_with_projections
GROUP BY county
ORDER BY avg(price) DESC
LIMIT 3
```

注意，这两个查询都针对原始表，并且在我们创建两个投影之前，这两个查询都进行了全表扫描（所有的 3003 万行都从磁盘流式传输）。

此外，请注意，列出伦敦中支付价格最高价格的查询流式传输了 217 万行。当我们直接使用一个为此查询优化的第二个表时，只有 81,920 行从磁盘流式传输。

差异的原因是当前对于投影不支持上述提到的 `optimize_read_in_order` 优化。

我们检查 `system.query_log` 表，以查看 ClickHouse 如何自动使用上述两个查询的两个投影（请参见下面的投影列）：

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

以下示例使用相同的英国价格数据集，比较使用与不使用投影的查询。

为了保留我们的原始表（及其性能），我们再次创建表的副本，使用 `CREATE AS` 和 `INSERT INTO SELECT`。

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

填充现有数据的投影。（如果不进行物化，该投影将仅为新插入的数据创建）：

```sql
ALTER TABLE uk.uk_price_paid_with_projections_v2
    MATERIALIZE PROJECTION projection_by_year_district_town
SETTINGS mutations_sync = 1
```

以下查询对比了使用和不使用投影的性能。要禁用投影使用，我们使用设置 [`optimize_use_projections`](/operations/settings/settings#optimize_use_projections)，默认启用。

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
结果应该是相同的，但后者的性能更好！


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

条件 (date >= '2020-01-01') 需要修改以便与投影维度匹配 (`toYear(date) >= 2020`)：

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

同样，结果是相同的，但请注意第二个查询的查询性能得到了改善。


## 相关内容 {#related-content}
- [ClickHouse 中主索引的实用介绍](/guides/best-practices/sparse-primary-indexes#option-3-projections)
- [物化视图](/docs/materialized-views)
- [ALTER PROJECTION](/sql-reference/statements/alter/projection)
