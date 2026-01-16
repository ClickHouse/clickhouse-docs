---
slug: /data-modeling/projections
title: '投影'
description: '本页介绍什么是投影、如何使用投影提升查询性能，以及它与物化视图的区别。'
keywords: ['投影', '投影', '查询优化']
sidebar_order: 1
doc_type: 'guide'
---

import projections_1 from '@site/static/images/data-modeling/projections_1.png';
import projections_2 from '@site/static/images/data-modeling/projections_2.png';
import Image from '@theme/IdealImage';

# 投影 \\{#projections\\}

## 简介 \\{#introduction\\}

ClickHouse 为实时场景下的大规模数据分析查询提供了多种加速机制。其中一种是使用 _Projections（投影）_ 来加速查询。Projections 通过根据关注的属性对数据进行重新排序来帮助优化查询，具体可以是：

1. 对整个数据进行完全重新排序
2. 原始表的一个子集，但采用不同的排序方式
3. 预计算的聚合结果（类似于物化视图），并且其排序方式
   与聚合维度对齐。

<br/>

<iframe width="560" height="315" src="https://www.youtube.com/embed/6CdnUdZSEG0?si=1zUyrP-tCvn9tXse" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Projections 如何工作？ \\{#how-do-projections-work\\}

在实践中，可以将 Projection 看作是原始表的一个额外的隐藏表。Projection 可以拥有与原始表不同的行顺序，因此也可以拥有不同的主索引，并且它可以自动、增量地预计算聚合值。因此，使用 Projections 可以通过两个“调优手段”来加速查询执行：

- **正确使用主索引**
- **预计算聚合**

Projections 在某些方面类似于 [物化视图](/materialized-views)
，它们同样允许你使用多种行顺序，并在插入时预计算聚合。
Projections 会自动更新，并与原始表保持同步；这与物化视图（Materialized Views）不同，后者需要显式更新。当查询针对原始表时，
ClickHouse 会自动对主键进行采样，并选择一个既能生成相同正确结果、又需要读取数据量最少的表，如下图所示：

<Image img={projections_1} size="md" alt="ClickHouse 中的 Projections"/>

### 使用 `_part_offset` 的更智能存储 \\{#smarter_storage_with_part_offset\\}

从 25.5 版本开始，ClickHouse 在 projection 中支持虚拟列 `_part_offset`，这为定义 projection 提供了一种新的方式。

现在有两种定义 projection 的方式：

- **存储完整列（原有行为）**：projection 包含完整数据，可以被直接读取，当过滤条件与 projection 的排序顺序匹配时，可以获得更快的查询性能。

- **仅存储排序键 + `_part_offset`**：projection 的工作方式类似索引。
  ClickHouse 使用 projection 的主索引来定位匹配的行，但从基表中读取实际数据。
  这样可以减少存储开销，但在查询时会略微增加 I/O。

上述方法也可以混合使用，在 projection 中直接存储部分列，而通过 `_part_offset` 间接存储其他列。

## 何时使用 Projections？ \\{#when-to-use-projections\\}

Projections 对新用户而言非常有吸引力，因为它们会在数据插入时自动维护。并且，查询只需发送到单个表，并在可能时利用 projections 来加速响应时间。

这与物化视图不同，后者要求用户根据过滤条件选择适当的已优化目标表，或者重写查询。这会对用户应用提出更高要求，并增加客户端的复杂度。

尽管有这些优点，projections 也存在一些固有限制，你应当了解这些限制，因此应谨慎使用，避免过度依赖。

- Projections 不允许对源表和（隐藏的）目标表使用不同的 TTL，而物化视图允许使用不同的 TTL。
- 对包含 projections 的表，不支持轻量级更新和删除。
- 物化视图可以链式使用：一个物化视图的目标表可以作为另一个物化视图的源表，依此类推。而 projections 无法做到这一点。
- Projection 定义不支持 join，但物化视图支持。不过，对包含 projections 的表进行的查询可以自由使用 join。
- Projection 定义不支持过滤条件（`WHERE` 子句），但物化视图支持。不过，对包含 projections 的表进行的查询可以自由使用过滤条件。

我们建议在以下场景使用 projections：

- 需要对数据进行完全重新排序时。虽然理论上，projection 中的表达式可以使用 `GROUP BY`，但物化视图在维护聚合方面更有效。查询优化器也更有可能利用仅做简单重排的 projections，即 `SELECT * ORDER BY x`。你可以在该表达式中选择列的子集，以减少存储占用。
- 用户能够接受可能带来的存储占用增加，以及将数据写入两次的额外开销时。请测试其对插入速度的影响，并[评估存储开销](/data-compression/compression-in-clickhouse)。

## 示例 \\{#examples\\}

### 在非主键列上进行过滤 \\{#filtering-without-using-primary-keys\\}

在这个示例中，我们将向你展示如何为表添加一个投影（projection）。
我们还将了解如何利用该投影加速在非主键列上进行过滤的查询。

在本示例中，我们将使用 New York Taxi Data
数据集（可在 [sql.clickhouse.com](https://sql.clickhouse.com/) 获取），该数据集按 `pickup_datetime` 排序。

现在我们来编写一个简单的查询语句，找出所有乘客
给司机小费超过 200 美元的行程 ID：

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

请注意，由于我们正在对未包含在 `ORDER BY` 中的 `tip_amount` 进行过滤，ClickHouse
不得不执行一次全表扫描。我们来加速这个查询。

为了保留原始表及其结果，我们将创建一个新表，并使用 `INSERT INTO SELECT` 来复制数据：

```sql
CREATE TABLE nyc_taxi.trips_with_projection AS nyc_taxi.trips;
INSERT INTO nyc_taxi.trips_with_projection SELECT * FROM nyc_taxi.trips;
```

要添加投影，我们使用 `ALTER TABLE` 语句配合 `ADD PROJECTION` 语句：

```sql
ALTER TABLE nyc_taxi.trips_with_projection
ADD PROJECTION prj_tip_amount
(
    SELECT *
    ORDER BY tip_amount, dateDiff('minutes', pickup_datetime, dropoff_datetime)
)
```

在添加 projection 之后，需要使用 `MATERIALIZE PROJECTION`
语句，使其中的数据根据上面指定的查询进行物理排序并重写：

```sql
ALTER TABLE nyc.trips_with_projection MATERIALIZE PROJECTION prj_tip_amount
```

现在我们已经添加了投影，再来运行一次该查询：

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips_with_projection WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

请注意，我们显著减少了查询时间，且需要扫描的行数也更少了。

我们可以通过查询 `system.query_log` 表来确认上面的查询确实使用了我们创建的投影：

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

### 使用投影加速英国房价已付数据查询 \\{#using-projections-to-speed-up-UK-price-paid\\}

为了演示如何使用投影来加速查询性能,我们
通过一个真实数据集的示例来说明。在本示例中,我们将
使用 [UK Property Price Paid](https://clickhouse.com/docs/getting-started/example-datasets/uk-price-paid)
教程中的表,该表包含 3003 万行数据。此数据集也可在
[sql.clickhouse.com](https://sql.clickhouse.com/?query_id=6IDMHK3OMR1C97J6M9EUQS)
环境中获取。

如果您想了解表的创建方式和数据插入过程,可以参阅 [&quot;英国房产价格数据集&quot;](/getting-started/example-datasets/uk-price-paid) 页面。

我们可以对此数据集运行两个简单的查询。第一个查询列出伦敦地区支付价格最高的郡县，第二个查询计算各郡县的平均价格：

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

请注意，尽管查询速度很快，但两个查询都对全部 3003 万行进行了全表扫描，这是因为在创建表时，`town` 和 `price` 都不在 ORDER BY 语句中：

```sql
CREATE TABLE uk.uk_price_paid
(
  ...
)
ENGINE = MergeTree
--highlight-next-line
ORDER BY (postcode1, postcode2, addr1, addr2);
```

让我们看看能否使用投影来加速这个查询。

为了保留原始表和结果,我们将创建一个新表并使用 `INSERT INTO SELECT` 复制数据:

```sql
CREATE TABLE uk.uk_price_paid_with_projections AS uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections SELECT * FROM uk.uk_price_paid;
```

我们创建并填充投影 `prj_oby_town_price`,它会生成一个额外的(隐藏)表,该表具有主索引,按城镇和价格排序,用于优化查询特定城镇中最高成交价格的郡县列表:

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

[`mutations_sync`](/operations/settings/settings#mutations_sync) 设置用于强制执行同步操作。

我们创建并填充投影 `prj_gby_county` —— 一个额外的（隐藏）表，
用于增量预计算所有现有 130 个英国郡的 avg(price) 聚合值：

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
如果在投影中使用了 `GROUP BY` 子句(例如上面的 `prj_gby_county` 投影),则(隐藏)表的底层存储引擎会变为 `AggregatingMergeTree`,所有聚合函数会被转换为 `AggregateFunction`。这可确保正确的增量数据聚合。
:::

下图展示了主表 `uk_price_paid_with_projections` 及其两个投影的可视化:

<Image img={projections_2} size="md" alt="主表 uk_price_paid_with_projections 及其两个投影的可视化展示" />

如果现在再次运行查询以列出伦敦成交价格最高的三个区县,可以看到查询性能有所提升:

```sql runnable
SELECT
  county,
  price
FROM uk.uk_price_paid_with_projections
WHERE town = 'LONDON'
ORDER BY price DESC
LIMIT 3
```

同样,对于列出英国平均房价最高的三个郡的查询:

```sql runnable
SELECT
    county,
    avg(price)
FROM uk.uk_price_paid_with_projections
GROUP BY county
ORDER BY avg(price) DESC
LIMIT 3
```

请注意，这两个查询都针对原始表，并且在创建这两个投影之前，两个查询都执行了全表扫描（从磁盘读取了全部 3003 万行数据）。

另外请注意，用于列出伦敦中成交价最高的三个县（county）的查询正在流式处理 217 万行数据。而当我们直接使用为该查询优化的第二张表时，只从磁盘流式读取了 8.192 万行数据。

造成这一差异的原因是，目前上文提到的 `optimize_read_in_order` 优化尚不支持应用于投影（projection）。

我们检查 `system.query_log` 表，可以看到 ClickHouse 在上面的两个查询中自动使用了两个投影（参见下面的 projections 列）：

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
第 1 行：
──────
tables:         ['uk.uk_price_paid_with_projections']
query:          SELECT
    county,
    avg(price)
FROM uk_price_paid_with_projections
GROUP BY county
ORDER BY avg(price) DESC
LIMIT 3
query_duration: 5 毫秒
read_rows:      132.00
projections:    ['uk.uk_price_paid_with_projections.prj_gby_county']

第 2 行：
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
query_duration: 11 毫秒
read_rows:      229 万
projections:    ['uk.uk_price_paid_with_projections.prj_obj_town_price']

返回 2 行。耗时：0.006 秒。
```

### 更多示例 \\{#further-examples\\}

以下示例继续使用相同的英国价格数据集，对比使用和不使用投影的查询。

为了保持原始表及其性能不受影响，我们再次使用 `CREATE AS` 和 `INSERT INTO SELECT` 创建该表的副本。

```sql
CREATE TABLE uk.uk_price_paid_with_projections_v2 AS uk.uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections_v2 SELECT * FROM uk.uk_price_paid;
```

#### 构建 Projection \\{#build-projection\\}

让我们基于 `toYear(date)`、`district` 和 `town` 这三个维度创建一个聚合 Projection：

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

为已有数据填充该 projection。（如果不进行物化，则该 projection 只会针对新插入的数据创建）：

```sql
ALTER TABLE uk.uk_price_paid_with_projections_v2
    MATERIALIZE PROJECTION projection_by_year_district_town
SETTINGS mutations_sync = 1
```

以下查询对比了启用和未启用投影时的性能。若要禁用投影功能，请使用设置 [`optimize_use_projections`](/operations/settings/settings#optimize_use_projections)，该设置默认是启用的。

#### 查询 1：各年份的平均价格 \\{#average-price-projections\\}

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

结果应该是相同的，但后一个示例的性能会更优！

#### 查询 2：伦敦历年平均价格 \\{#average-price-london-projections\\}

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

#### 查询 3：最昂贵的街区 \\{#most-expensive-neighborhoods-projections\\}

条件 (date &gt;= &#39;2020-01-01&#39;) 需要进行修改，以便与投影维度 (`toYear(date) >= 2020)` 保持一致：

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

同样，结果相同，但请注意第二个查询的执行性能有所提升。

### 在单个查询中组合投影 \\{#combining-projections\\}

从 25.6 版本开始，在前一版本引入的 `_part_offset` 支持基础之上，ClickHouse
现在可以在带有多个过滤条件的单个查询中使用多个投影来加速查询。

需要注意的是，ClickHouse 仍然只会从一个投影（或基础表）中读取数据，
但可以利用其他投影的主键索引在读取之前剪枝掉不必要的 part。
这对于在多个列上进行过滤，且每一列可能分别匹配到不同投影的查询尤其有用。

> 当前，该机制只会剪枝整个 part。尚不支持粒度级（granule-level）的剪枝。

为演示这一点，我们定义表（带有使用 `_part_offset` 列的投影），
并插入与上文图示相对应的五行示例数据。

```sql
CREATE TABLE page_views
(
    id UInt64,
    event_date Date,
    user_id UInt32,
    url String,
    region String,
    PROJECTION region_proj
    (
        SELECT _part_offset ORDER BY region
    ),
    PROJECTION user_id_proj
    (
        SELECT _part_offset ORDER BY user_id
    )
)
ENGINE = MergeTree
ORDER BY (event_date, id)
SETTINGS
  index_granularity = 1, -- 每个粒度一行
  max_bytes_to_merge_at_max_space_in_pool = 1; -- 禁用合并
```

然后向表中插入数据：

```sql
INSERT INTO page_views VALUES (
1, '2025-07-01', 101, 'https://example.com/page1', 'europe');
INSERT INTO page_views VALUES (
2, '2025-07-01', 102, 'https://example.com/page2', 'us_west');
INSERT INTO page_views VALUES (
3, '2025-07-02', 106, 'https://example.com/page3', 'us_west');
INSERT INTO page_views VALUES (
4, '2025-07-02', 107, 'https://example.com/page4', 'us_west');
INSERT INTO page_views VALUES (
5, '2025-07-03', 104, 'https://example.com/page5', 'asia');
```

:::note
注意：该表为了演示使用了自定义设置，例如单行 granule（粒度单元）以及禁用 part 合并，这些设置不建议在生产环境中使用。
:::

此设置会产生：

* 五个独立的 part（每插入一行生成一个 part）
* 每行一个主键索引条目（在基础表和每个 projection 中）
* 每个 part 都只包含一行

在此设置下，我们运行一个同时按 `region` 和 `user_id` 进行过滤的查询。
由于基础表的主键索引是基于 `event_date` 和 `id` 构建的，
在这里帮不上忙，因此 ClickHouse 会改为使用：

* `region_proj` 按 `region` 剪枝 part
* `user_id_proj` 进一步按 `user_id` 剪枝 part

可以使用 `EXPLAIN projections = 1` 观察这一行为，它会展示 ClickHouse 如何选择并应用 projection。

```sql
EXPLAIN projections=1
SELECT * FROM page_views WHERE region = 'us_west' AND user_id = 107;
```

```response
    ┌─explain────────────────────────────────────────────────────────────────────────────────┐
 1. │ Expression ((投影名称 + 投影))                                              │
 2. │   Expression                                                                           │                                                                        
 3. │     ReadFromMergeTree (default.page_views)                                             │
 4. │     投影:                                                                       │
 5. │       名称: region_proj                                                                │
 6. │         描述: 投影已分析并用于数据分片级别过滤 │
 7. │         条件: (region in ['us_west', 'us_west'])                                  │
 8. │         搜索算法: 二分查找                                                │
 9. │         数据分片: 3                                                                       │
10. │         标记: 3                                                                       │
11. │         范围: 3                                                                      │
12. │         行数: 3                                                                        │
13. │         已过滤数据分片: 2                                                              │
14. │       名称: user_id_proj                                                               │
15. │         描述: 投影已分析并用于数据分片级别过滤 │
16. │         条件: (user_id in [107, 107])                                             │
17. │         搜索算法: 二分查找                                                │
18. │         数据分片: 1                                                                       │
19. │         标记: 1                                                                       │
20. │         范围: 1                                                                      │
21. │         行数: 1                                                                        │
22. │         已过滤数据分片: 2                                                              │
    └────────────────────────────────────────────────────────────────────────────────────────┘
```

`EXPLAIN` 的输出（如上所示）自上而下展示了逻辑查询计划：

| 行号 | 描述                                                                                              |
|------|---------------------------------------------------------------------------------------------------|
| 3    | 计划从 `page_views` 基表中读取数据                                                                |
| 5-13 | 使用 `region_proj` 来定位 `region = 'us_west'` 的 3 个分片，从而在 5 个分片中裁剪掉 2 个          |
| 14-22| 使用 `user_id_proj` 来定位 `user_id = 107` 的 1 个分片，进一步从剩余的 3 个分片中再裁剪掉 2 个   |

最终，只需要从基表中读取 **5 个分片中的 1 个**。
通过结合多个 projection 的索引分析结果，ClickHouse 能显著减少扫描的数据量，
在保持存储开销较低的同时提升性能。

## 相关内容 \\{#related-content\\}

- [ClickHouse 主键索引实用入门指南](/guides/best-practices/sparse-primary-indexes#option-3-projections)
- [物化视图](/docs/materialized-views)
- [ALTER PROJECTION](/sql-reference/statements/alter/projection)