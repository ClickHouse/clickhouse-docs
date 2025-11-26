---
slug: /data-modeling/projections
title: '投影'
description: '本页介绍投影的概念、如何利用投影提升查询性能，以及它们与物化视图的区别。'
keywords: ['投影', '投影', '查询优化']
sidebar_order: 1
doc_type: 'guide'
---

import projections_1 from '@site/static/images/data-modeling/projections_1.png';
import projections_2 from '@site/static/images/data-modeling/projections_2.png';
import Image from '@theme/IdealImage';


# 投影



## 介绍 {#introduction}

ClickHouse 为实时场景下的大规模数据分析查询提供了多种加速机制。其中一种用于加速查询的机制是使用 _Projections_。Projections 通过按关注的属性对数据进行重新排序来帮助优化查询。这种重新排序可以是：

1. 完整的重新排序
2. 按不同排序方式组织的原始表子集
3. 预计算的聚合结果（类似于物化视图），但其排序方式与该聚合相匹配。

<br/>
<iframe width="560" height="315" src="https://www.youtube.com/embed/6CdnUdZSEG0?si=1zUyrP-tCvn9tXse" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>



## Projection 如何工作？ {#how-do-projections-work}

在实际应用中，可以将 Projection 看作是原始表上的一个额外的、隐藏的表。Projection 可以具有与原始表不同的行排序，因此其主索引也可以不同，并且它可以自动、增量地预计算聚合值。因此，使用 Projection 为加速查询执行提供了两个“调优手段”：

- **正确使用主索引**
- **预计算聚合**

Projection 在某些方面与 [物化视图](/materialized-views) 类似，它们同样允许你拥有多种行排序方式，并在插入时预计算聚合。  
Projection 会自动更新并与原始表保持同步，而物化视图则需要显式更新。当查询针对原始表时，ClickHouse 会自动采样主键并选择一个既能生成同样正确结果、又需要读取数据量最少的表，如下图所示：

<Image img={projections_1} size="md" alt="ClickHouse 中的 Projections"/>

### 通过 `_part_offset` 实现更智能的存储 {#smarter_storage_with_part_offset}

从 25.5 版本开始，ClickHouse 在 Projection 中支持虚拟列 `_part_offset`，它提供了一种定义 Projection 的新方式。

现在有两种定义 Projection 的方式：

- **存储完整列（原有行为）**：Projection 包含完整数据，可以被直接读取，当过滤条件与 Projection 的排序顺序匹配时性能更高。

- **仅存储排序键 + `_part_offset`**：Projection 的工作方式类似索引。  
  ClickHouse 使用 Projection 的主索引定位匹配的行，但从基表中读取实际数据。这样可以降低存储开销，但在查询时会稍微增加 I/O。

上述两种方式也可以混合使用，将部分列直接存储在 Projection 中，而其他列通过 `_part_offset` 间接访问。



## 何时使用 Projections？ {#when-to-use-projections}

Projections 对新用户来说是一个颇具吸引力的功能，因为它会在数据插入时自动维护。此外，查询只需发送到单个表，查询优化器会在可能的情况下利用 Projections 来加快响应时间。

这与 Materialized Views 形成对比：使用后者时，用户必须根据过滤条件选择合适的已优化目标表，或重写查询。这会对用户应用提出更高要求，并增加客户端侧的复杂度。

尽管有这些优势，Projections 也存在一些固有的限制，用户应当了解，因此应谨慎、少量地部署。

- Projections 不允许为源表和（隐藏的）目标表使用不同的 TTL，而 Materialized Views 允许使用不同的 TTL。
- 启用 Projections 的表不支持轻量级更新和删除。
- Materialized Views 可以链式使用：一个 Materialized View 的目标表可以作为另一个 Materialized View 的源表，依此类推。而 Projections 不支持这种用法。
- Projections 不支持 join，而 Materialized Views 支持。
- Projections 不支持过滤（`WHERE` 子句），而 Materialized Views 支持。

我们建议在以下场景中使用 Projections：

- 需要对数据进行完全重新排序时。虽然 Projection 中的表达式理论上可以使用 `GROUP BY`，但 Materialized Views 在维护聚合方面更高效。查询优化器也更有可能利用只进行简单重排的 Projections，即 `SELECT * ORDER BY x`。用户可以在该表达式中仅选择部分列，以降低存储占用。
- 用户能够接受潜在的存储占用增加以及将数据写入两次所带来的开销。请测试对插入速度的影响，并[评估存储开销](/data-compression/compression-in-clickhouse)。



## 示例

### 在不属于主键的列上进行过滤

在这个示例中，我们将介绍如何为一张表添加一个 projection。
同时，我们还将说明如何使用该 projection 来加速在不属于表主键的列上进行过滤的查询。

在本示例中，我们将使用可在 [sql.clickhouse.com](https://sql.clickhouse.com/) 获取的 New York Taxi Data
数据集，该数据集按 `pickup_datetime` 排序。

让我们编写一个简单的查询，找出所有乘客给司机小费
大于 200 美元的行程 ID：

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

请注意，由于我们在过滤不在 `ORDER BY` 中的 `tip_amount`，ClickHouse 不得不执行全表扫描。下面我们来加快这个查询。

为了保留原始表和查询结果，我们将创建一个新表，并使用 `INSERT INTO SELECT` 来复制数据：

```sql
CREATE TABLE nyc_taxi.trips_with_projection AS nyc_taxi.trips;
INSERT INTO nyc_taxi.trips_with_projection SELECT * FROM nyc_taxi.trips;
```

要添加一个 projection，我们使用 `ALTER TABLE` 语句结合 `ADD PROJECTION` 语句：

```sql
ALTER TABLE nyc_taxi.trips_with_projection
添加 投影 prj_tip_amount
(
    SELECT *
    ORDER BY tip_amount, dateDiff('minutes', pickup_datetime, dropoff_datetime)
)
```

在添加 projection 之后，必须使用 `MATERIALIZE PROJECTION`
语句，这样其中的数据才会根据上面指定的查询进行物理排序并重写：

```sql
ALTER TABLE nyc.trips_with_projection MATERIALIZE PROJECTION prj_tip_amount
```

现在我们已经添加了投影，让我们再运行一次这个查询：

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips_with_projection WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

请注意，我们显著减少了查询时间，并且需要扫描的行数也更少了。

我们可以通过查询 `system.query_log` 表来确认上述查询确实使用了我们创建的投影：

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

### 使用投影加速英国房价支付查询

为了演示如何使用投影来提升查询性能，我们来看一个基于真实数据集的示例。在本示例中，我们将使用来自我们的 [UK Property Price Paid](https://clickhouse.com/docs/getting-started/example-datasets/uk-price-paid)
教程中的表，该表包含 3003 万行记录。该数据集同样可以在我们的
[sql.clickhouse.com](https://sql.clickhouse.com/?query_id=6IDMHK3OMR1C97J6M9EUQS)
环境中使用。

如果您希望了解该表是如何创建以及数据是如何插入的，可以参考《[The UK property prices dataset](/getting-started/example-datasets/uk-price-paid)》页面。

我们可以在该数据集上运行两个简单的查询。第一个查询列出伦敦房价最高的各郡，
第二个则计算各个郡的平均价格：

```sql runnable
SELECT
  county,
  price
FROM uk.uk_price_paid
WHERE town = '伦敦'
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

请注意，尽管查询速度非常快，这两条查询仍然对整张表的 3003 万行数据进行了全表扫描，
这是因为在创建表时的 `ORDER BY` 子句中，既没有包含 `town` 列，也没有包含 `price` 列：

```sql
CREATE TABLE uk.uk_price_paid
(
  ...
)
ENGINE = MergeTree
--highlight-next-line
ORDER BY (postcode1, postcode2, addr1, addr2);
```

让我们看看是否可以使用投影来加速这个查询。

为保留原始表及其结果，我们将创建一个新表，并使用 `INSERT INTO SELECT` 复制数据：

```sql
CREATE TABLE uk.uk_price_paid_with_projections AS uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections SELECT * FROM uk.uk_price_paid;
```

我们创建并填充投影 `prj_oby_town_price`，它会生成一个附加的（隐藏的）表，
该表带有主索引，并按 town 和 price 排序，用于优化如下查询：
在指定 town 中列出最高价格对应的 counties。

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

[`mutations_sync`](/operations/settings/settings#mutations_sync) 设置用于强制以同步方式执行。

我们创建并填充投影 `prj_gby_county` —— 一个额外的（隐藏的）表，
用于以增量方式预先计算所有现有的 130 个英国郡的 avg(price) 聚合值：

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
如果在如上面 `prj_gby_county` 投影那样的投影中使用了 `GROUP BY` 子句，那么（隐藏）表的底层存储引擎会变为 `AggregatingMergeTree`，并且所有聚合函数都会被转换为 `AggregateFunction`。这可以确保正确地进行增量数据聚合。
:::

下图是主表 `uk_price_paid_with_projections` 及其两个投影的可视化示意图：

<Image img={projections_2} size="md" alt="主表 uk_price_paid_with_projections 及其两个投影的可视化示意图" />

如果现在再次运行查询，列出伦敦中成交价格最高的三个价格及其所属郡，我们就会看到查询性能有所提升：

```sql runnable
SELECT
  county,
  price
FROM uk.uk_price_paid_with_projections
WHERE town = 'LONDON'
ORDER BY price DESC
LIMIT 3
```

同样，对于列出平均支付价格最高的三个英国郡县的查询：

```sql runnable
SELECT
    county,
    avg(price)
FROM uk.uk_price_paid_with_projections
GROUP BY county
ORDER BY avg(price) DESC
LIMIT 3
```

请注意，这两个查询都是针对原始表执行的，并且在我们创建这两个 projection 之前，这两个查询都会进行一次全表扫描（从磁盘流式读取全部 3003 万行数据）。

另外请注意，用于列出伦敦中支付价格最高的前三个郡的查询，会流式读取 217 万行数据。而当我们直接使用一张专门为该查询优化的第二张表时，仅有 8.192 万行数据从磁盘被流式读取。

造成这一差异的原因在于，目前上文提到的 `optimize_read_in_order` 优化尚不支持用于 projection。

我们检查 `system.query_log` 表，以确认 ClickHouse 为上述两个查询自动使用了这两个 projection（见下方的 projections 列）：

```sql
SELECT
  tables,
  query,
  query_duration_ms::String ||  ' 毫秒' AS query_duration,
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

### 更多示例

以下示例使用相同的英国价格数据集，对比使用和不使用投影的查询。

为了保持原始表（及其性能）不受影响，我们再次使用 `CREATE AS` 和 `INSERT INTO SELECT` 创建该表的副本。

```sql
CREATE TABLE uk.uk_price_paid_with_projections_v2 AS uk.uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections_v2 SELECT * FROM uk.uk_price_paid;
```

#### 构建 Projection

让我们基于维度 `toYear(date)`、`district` 和 `town` 创建一个聚合 Projection：

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

为现有数据填充该投影。（如果不进行物化，则该投影只会为之后新插入的数据创建）：

```sql
ALTER TABLE uk.uk_price_paid_with_projections_v2
    MATERIALIZE PROJECTION projection_by_year_district_town
SETTINGS mutations_sync = 1
```

下面的查询对比了启用和未启用投影（projection）时的性能。要禁用投影，我们使用设置项 [`optimize_use_projections`](/operations/settings/settings#optimize_use_projections)，该设置默认开启。

#### 查询 1：每年平均价格

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

结果应该相同，但后一个示例的性能会更好！

#### 查询 2：伦敦每年的平均价格

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

#### 查询 3：最昂贵的社区

需要将条件 (date &gt;= &#39;2020-01-01&#39;) 修改为与投影维度 (`toYear(date) &gt;= 2020)` 一致：

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

同样，结果是相同的，但请注意第二个查询的性能有所提升。

### 在一个查询中组合多个 projection

从 25.6 版本开始，在上一版本引入对 `_part_offset` 的支持基础上，ClickHouse 现在可以在带有多个过滤条件的单个查询中使用多个 projection 来加速查询。

需要强调的是，ClickHouse 仍然只会从一个 projection（或基础表）中读取数据，但可以利用其他 projection 的主索引在读取前裁剪掉不必要的 part。对于在多个列上进行过滤、且每个过滤条件可能匹配到不同 projection 的查询，这一特性尤其有用。

> 当前，该机制只能裁剪整个 part，尚不支持粒度级别的裁剪。

为了演示这一点，我们定义了一个表（其 projection 使用 `_part_offset` 列），并插入了五行示例数据，以对应上面的示意图。

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

然后向该表中插入数据：

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
注意：此表为了演示使用了自定义设置，例如单行 granule 和禁用 part 合并，这些设置不推荐用于生产环境。
:::

此设置会产生：

* 五个独立的 part（每插入一行生成一个 part）
* 每行一个主键索引项（在基础表和每个 projection 中都是如此）
* 每个 part 中正好包含一行数据

在此设置下，我们运行一个同时在 `region` 和 `user_id` 上过滤的查询。
由于基础表的主键索引是基于 `event_date` 和 `id` 构建的，
在这里并没有帮助，因此 ClickHouse 会使用：

* `region_proj` 按 `region` 剪枝 part
* `user_id_proj` 进一步按 `user_id` 剪枝 part

可以通过 `EXPLAIN projections = 1` 看到这一行为，它展示了
ClickHouse 如何选择并应用 projection。

```sql
EXPLAIN projections=1
SELECT * FROM page_views WHERE region = 'us_west' AND user_id = 107;
```


```response
    ┌─explain────────────────────────────────────────────────────────────────────────────────┐
 1. │ 表达式 ((投影名称 + 投影))                                              │
 2. │   表达式                                                                           │                                                                        
 3. │     从 MergeTree 读取 (default.page_views)                                             │
 4. │     投影:                                                                       │
 5. │       名称: region_proj                                                                │
 6. │         描述: 投影已分析并用于数据分片级过滤 │
 7. │         条件: (region in ['us_west', 'us_west'])                                  │
 8. │         搜索算法: 二分查找                                                │
 9. │         数据分片数: 3                                                                       │
10. │         标记数: 3                                                                       │
11. │         范围数: 3                                                                      │
12. │         行数: 3                                                                        │
13. │         已过滤数据分片数: 2                                                              │
14. │       名称: user_id_proj                                                               │
15. │         描述: 投影已分析并用于数据分片级过滤 │
16. │         条件: (user_id in [107, 107])                                             │
17. │         搜索算法: 二分查找                                                │
18. │         数据分片数: 1                                                                       │
19. │         标记数: 1                                                                       │
20. │         范围数: 1                                                                      │
21. │         行数: 1                                                                        │
22. │         已过滤数据分片数: 2                                                              │
    └────────────────────────────────────────────────────────────────────────────────────────┘
```

`EXPLAIN` 的输出（如上所示）从上到下展示了逻辑查询计划：

| 行号    | 描述                                                                            |
| ----- | ----------------------------------------------------------------------------- |
| 3     | 计划从 `page_views` 基表读取数据                                                       |
| 5-13  | 使用 `region_proj` 来定位满足 region = &#39;us&#95;west&#39; 的 3 个分片，剪枝掉 5 个分片中的 2 个 |
| 14-22 | 使用 `user_id_proj` 来定位满足 `user_id = 107` 的 1 个分片，进一步剪枝掉剩余 3 个分片中的 2 个          |

最终，基表中只读取了 **5 个分片中的 1 个**。
通过结合多个投影的索引分析，ClickHouse 显著减少了扫描的数据量，
在保持较低存储开销的同时提升了性能。


## 相关内容 {#related-content}
- [ClickHouse 主索引实用介绍](/guides/best-practices/sparse-primary-indexes#option-3-projections)
- [物化视图](/docs/materialized-views)
- [ALTER PROJECTION](/sql-reference/statements/alter/projection)
