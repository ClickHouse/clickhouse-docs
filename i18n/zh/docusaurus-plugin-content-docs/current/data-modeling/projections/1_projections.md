---
slug: /data-modeling/projections
title: '投影'
description: '本页介绍什么是投影、如何通过投影提升查询性能，以及投影与物化视图之间的区别。'
keywords: ['projection', 'projections', 'query optimization']
sidebar_order: 1
doc_type: 'guide'
---

import projections_1 from '@site/static/images/data-modeling/projections_1.png';
import projections_2 from '@site/static/images/data-modeling/projections_2.png';
import Image from '@theme/IdealImage';


# 投影



## 简介 {#introduction}

ClickHouse 提供了多种机制来加速实时场景中大量数据的分析查询。其中一种加速查询的机制是使用 _投影（Projections）_。投影通过按关注的属性对数据进行重新排序来帮助优化查询。具体可以是：

1. 完全重新排序
2. 原始表的子集，采用不同的排序方式
3. 预计算的聚合（类似于物化视图），但排序方式与聚合保持一致。

<br />
<iframe
  width='560'
  height='315'
  src='https://www.youtube.com/embed/6CdnUdZSEG0?si=1zUyrP-tCvn9tXse'
  title='YouTube 视频播放器'
  frameborder='0'
  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
  referrerpolicy='strict-origin-when-cross-origin'
  allowfullscreen
></iframe>


## Projection 如何工作？ {#how-do-projections-work}

实际上,Projection 可以理解为原始表的一个附加隐藏表。Projection 可以具有不同的行顺序,因此拥有与原始表不同的主索引,并且能够自动增量地预计算聚合值。因此,使用 Projection 提供了两个加速查询执行的"调优手段":

- **合理使用主索引**
- **预计算聚合**

Projection 在某些方面类似于 [物化视图](/materialized-views),后者同样允许您使用多种行顺序并在插入时预计算聚合。与需要显式更新的物化视图不同,Projection 会自动更新并与原始表保持同步。当查询针对原始表时,ClickHouse 会自动采样主键并选择一个能够生成相同正确结果但需要读取最少数据量的表,如下图所示:

<Image img={projections_1} size='md' alt='ClickHouse 中的 Projection' />

### 使用 `_part_offset` 实现更智能的存储 {#smarter_storage_with_part_offset}

自 25.5 版本起,ClickHouse 在 Projection 中支持虚拟列 `_part_offset`,这提供了一种定义 Projection 的新方式。

现在有两种方式来定义 Projection:

- **存储完整列(原始行为)**:Projection 包含完整数据并可以直接读取,当过滤条件匹配 Projection 的排序顺序时可提供更快的性能。

- **仅存储排序键 + `_part_offset`**:Projection 的工作方式类似索引。ClickHouse 使用 Projection 的主索引来定位匹配的行,但从基表读取实际数据。这减少了存储开销,代价是在查询时需要稍多的 I/O 操作。

上述方法也可以混合使用,在 Projection 中存储某些列,而通过 `_part_offset` 间接存储其他列。


## 何时使用投影？ {#when-to-use-projections}

投影对新用户来说是一个极具吸引力的特性，因为它们会在数据插入时自动维护。此外，查询只需发送到单个表，投影会在可能的情况下自动被利用以加快响应时间。

这与物化视图形成对比。在物化视图中，用户必须根据过滤条件选择合适的优化目标表或重写查询。这对用户应用程序提出了更高的要求，并增加了客户端的复杂性。

尽管有这些优势，投影也存在一些固有的限制，用户应该了解这些限制，因此应谨慎部署。

- 投影不允许为源表和（隐藏的）目标表使用不同的 TTL，而物化视图允许使用不同的 TTL。
- 带有投影的表不支持轻量级更新和删除操作。
- 物化视图可以链式连接：一个物化视图的目标表可以作为另一个物化视图的源表，依此类推。投影无法实现这一点。
- 投影不支持连接（join）操作，但物化视图支持。
- 投影不支持过滤条件（`WHERE` 子句），但物化视图支持。

我们建议在以下情况下使用投影：

- 需要对数据进行完全重新排序。虽然投影中的表达式理论上可以使用 `GROUP BY`，但物化视图在维护聚合方面更为有效。查询优化器也更有可能利用使用简单重新排序的投影，即 `SELECT * ORDER BY x`。用户可以在此表达式中选择列的子集以减少存储占用。
- 用户能够接受可能带来的存储占用增加以及两次写入数据的开销。请测试对插入速度的影响并[评估存储开销](/data-compression/compression-in-clickhouse)。


## 示例 {#examples}

### 对不在主键中的列进行过滤 {#filtering-without-using-primary-keys}

在本示例中,我们将展示如何向表中添加投影。
我们还将了解如何使用投影来加速对表中非主键列进行过滤的查询。

在本示例中,我们将使用 [sql.clickhouse.com](https://sql.clickhouse.com/) 上提供的纽约出租车数据集,该数据集按 `pickup_datetime` 排序。

让我们编写一个简单的查询来查找所有乘客给司机小费超过 200 美元的行程 ID:

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

请注意,由于我们对不在 `ORDER BY` 中的 `tip_amount` 进行过滤,ClickHouse 必须执行全表扫描。让我们来加速这个查询。

为了保留原始表和结果,我们将创建一个新表并使用 `INSERT INTO SELECT` 复制数据:

```sql
CREATE TABLE nyc_taxi.trips_with_projection AS nyc_taxi.trips;
INSERT INTO nyc_taxi.trips_with_projection SELECT * FROM nyc_taxi.trips;
```

要添加投影,我们使用 `ALTER TABLE` 语句和 `ADD PROJECTION` 语句:

```sql
ALTER TABLE nyc_taxi.trips_with_projection
ADD PROJECTION prj_tip_amount
(
    SELECT *
    ORDER BY tip_amount, dateDiff('minutes', pickup_datetime, dropoff_datetime)
)
```

添加投影后,需要使用 `MATERIALIZE PROJECTION` 语句,以便根据上面指定的查询对其中的数据进行物理排序和重写:

```sql
ALTER TABLE nyc.trips_with_projection MATERIALIZE PROJECTION prj_tip_amount
```

现在我们已经添加了投影,让我们再次运行查询:

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips_with_projection WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

请注意,我们能够大幅减少查询时间,并且需要扫描的行数更少。

我们可以通过查询 `system.query_log` 表来确认上面的查询确实使用了我们创建的投影:

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

### 使用投影加速英国房价查询 {#using-projections-to-speed-up-UK-price-paid}

为了演示如何使用投影来加速查询性能,让我们看一个使用真实数据集的示例。在本示例中,我们将使用来自 [UK Property Price Paid](https://clickhouse.com/docs/getting-started/example-datasets/uk-price-paid) 教程的表,该表包含 3003 万行数据。该数据集也可在我们的 [sql.clickhouse.com](https://sql.clickhouse.com/?query_id=6IDMHK3OMR1C97J6M9EUQS) 环境中使用。

如果您想了解如何创建表和插入数据,可以参考["英国房价数据集"](/getting-started/example-datasets/uk-price-paid)页面。

我们可以对该数据集运行两个简单的查询。第一个查询列出伦敦支付价格最高的郡,第二个查询计算各郡的平均价格:

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

请注意，尽管速度非常快，这两个查询实际上都对全部 3003 万行数据进行了全表扫描，
这是因为在创建表时，我们的 `ORDER BY` 子句中既没有包含 `town` 也没有包含 `price`：

```sql
CREATE TABLE uk.uk_price_paid
(
  ...
)
ENGINE = MergeTree
--highlight-next-line
ORDER BY (postcode1, postcode2, addr1, addr2);
```

让我们看看能否通过使用投影来加速这个查询。

为了保留原始表和查询结果，我们将创建一个新表，并使用 `INSERT INTO SELECT` 来复制数据：

```sql
CREATE TABLE uk.uk_price_paid_with_projections AS uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections SELECT * FROM uk.uk_price_paid;
```

我们创建并填充投影 `prj_oby_town_price`。该投影会生成一个带有主索引、按 town 和 price 排序的额外（隐藏）表，用于优化如下查询：在指定 town 中按最高支付价格列出各县（county）：

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

[`mutations_sync`](/operations/settings/settings#mutations_sync) 设置
用于强制执行同步操作。

我们创建并填充投影 `prj_gby_county` —— 一个额外的（隐藏的）数据表，
用于以增量方式预先计算所有现有 130 个英国郡的 avg(price) 聚合值：

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
如果在投影中使用了 `GROUP BY` 子句，例如上面的 `prj_gby_county`
投影，那么（隐藏）表的底层存储引擎会变为 `AggregatingMergeTree`，
并且所有聚合函数都会被转换为 `AggregateFunction`。这样可以确保数据能够被正确地进行增量聚合。
:::

下图是主表 `uk_price_paid_with_projections`
及其两个投影的可视化示意图：

<Image img={projections_2} size="md" alt="主表 uk_price_paid_with_projections 及其两个投影的可视化示意图" />

如果我们现在再次运行那个查询（列出伦敦中价格最高的三笔成交对应的行政郡），
就会看到查询性能有所提升：

```sql runnable
SELECT
  county,
  price
FROM uk.uk_price_paid_with_projections
WHERE town = 'LONDON'
ORDER BY price DESC
LIMIT 3
```

同样，对于这个查询（用于列出英国郡县中平均支付价格最高的前三个郡）：

```sql runnable
SELECT
    county,
    avg(price)
FROM uk.uk_price_paid_with_projections
GROUP BY county
ORDER BY avg(price) DESC
LIMIT 3
```

请注意，这两个查询都针对原始表执行，并且在我们创建这两个投影之前，这两个查询都进行了全表扫描（所有 30.03 百万行都从磁盘中被读取）。

另外请注意，用于列出伦敦中支付价格最高的三条记录所对应郡县的查询，会扫描 2.17 百万行。当我们直接使用为该查询优化的第二张表时，只从磁盘中读取了 81.92 千行。

出现这种差异的原因在于，目前上文提到的 `optimize_read_in_order` 优化尚不支持投影。

我们检查 `system.query_log` 表，可以看到 ClickHouse
自动为上面的两个查询使用了这两个投影（见下方的 projections 列）：

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

以下示例使用相同的英国房价数据集,对比使用投影和不使用投影的查询效果。

为了保留原始表(及其性能),我们再次使用 `CREATE AS` 和 `INSERT INTO SELECT` 创建表的副本。

```sql
CREATE TABLE uk.uk_price_paid_with_projections_v2 AS uk.uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections_v2 SELECT * FROM uk.uk_price_paid;
```

#### 构建投影 {#build-projection}

让我们按 `toYear(date)`、`district` 和 `town` 维度创建一个聚合投影:

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

为现有数据填充投影。(如果不进行物化,投影将仅为新插入的数据创建):

```sql
ALTER TABLE uk.uk_price_paid_with_projections_v2
    MATERIALIZE PROJECTION projection_by_year_district_town
SETTINGS mutations_sync = 1
```

以下查询对比使用投影和不使用投影的性能。要禁用投影使用,我们使用 [`optimize_use_projections`](/operations/settings/settings#optimize_use_projections) 设置,该设置默认启用。

#### 查询 1. 每年平均价格 {#average-price-projections}

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

结果应该相同,但后一个示例的性能更好!

#### 查询 2. 伦敦每年平均价格 {#average-price-london-projections}

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

#### 查询 3. 最昂贵的街区 {#most-expensive-neighborhoods-projections}

条件 (date >= '2020-01-01') 需要修改以匹配投影维度 (`toYear(date) >= 2020)`):

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

同样,结果相同,但请注意第二个查询的性能提升。

### 在单个查询中组合多个投影 {#combining-projections}

从 25.6 版本开始,基于前一版本引入的 `_part_offset` 支持,ClickHouse 现在可以使用多个投影来加速包含多个过滤条件的单个查询。

重要的是,ClickHouse 仍然只从一个投影(或基表)读取数据,但可以在读取之前使用其他投影的主索引来裁剪不必要的数据分区。这对于在多个列上进行过滤的查询特别有用,每个列可能匹配不同的投影。

> 目前,此机制仅裁剪整个数据分区。尚不支持颗粒级裁剪。

为了演示这一点,我们定义表(使用包含 `_part_offset` 列的投影)并插入与上图匹配的五个示例行。

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
  index_granularity = 1, -- one row per granule
  max_bytes_to_merge_at_max_space_in_pool = 1; -- disable merge
```

然后我们向表中插入数据:

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
注意:该表使用自定义设置进行演示,例如单行颗粒和禁用分区合并,这些设置不建议在生产环境中使用。
:::

此设置产生:

- 五个独立的数据分区(每个插入行一个)
- 每行一个主索引条目(在基表和每个投影中)
- 每个分区恰好包含一行

使用此设置,我们运行一个同时对 `region` 和 `user_id` 进行过滤的查询。由于基表的主索引是从 `event_date` 和 `id` 构建的,在这里无法提供帮助,因此 ClickHouse 使用:

- `region_proj` 按区域裁剪分区
- `user_id_proj` 进一步按 `user_id` 裁剪

使用 `EXPLAIN projections = 1` 可以看到此行为,它显示了 ClickHouse 如何选择和应用投影。

```sql
EXPLAIN projections=1
SELECT * FROM page_views WHERE region = 'us_west' AND user_id = 107;
```


```response
    ┌─explain────────────────────────────────────────────────────────────────────────────────┐
 1. │ Expression ((Project names + Projection))                                              │
 2. │   Expression                                                                           │                                                                        
 3. │     ReadFromMergeTree (default.page_views)                                             │
 4. │     Projections:                                                                       │
 5. │       Name: region_proj                                                                │
 6. │         描述:投影已分析并用于数据分片级过滤 │
 7. │         Condition: (region in ['us_west', 'us_west'])                                  │
 8. │         搜索算法:二分查找                                                │
 9. │         Parts: 3                                                                       │
10. │         Marks: 3                                                                       │
11. │         Ranges: 3                                                                      │
12. │         Rows: 3                                                                        │
13. │         已过滤数据分片数:2                                                              │
14. │       Name: user_id_proj                                                               │
15. │         描述:投影已分析并用于数据分片级过滤 │
16. │         Condition: (user_id in [107, 107])                                             │
17. │         搜索算法:二分查找                                                │
18. │         Parts: 1                                                                       │
19. │         Marks: 1                                                                       │
20. │         Ranges: 1                                                                      │
21. │         Rows: 1                                                                        │
22. │         已过滤数据分片数:2                                                              │
    └────────────────────────────────────────────────────────────────────────────────────────┘
```

上面的 `EXPLAIN` 输出从上到下展示了逻辑查询计划：

| Row number | Description                                                                   |
| ---------- | ----------------------------------------------------------------------------- |
| 3          | 计划从 `page_views` 基表中读取数据                                                      |
| 5-13       | 使用 `region_proj` 找出 `region = &#39;us&#95;west&#39;` 的 3 个分片，将 5 个分片中的 2 个裁剪掉 |
| 14-22      | 使用 `user_id_proj` 找出 `user_id = 107` 的 1 个分片，在剩余的 3 个分片中再裁剪掉 2 个              |

最终，仅从基表中读取了 **5 个分片中的 1 个**。
通过结合多个 projection 的索引分析，ClickHouse 显著减少了扫描的数据量，
在保持存储开销较低的同时提升了性能。


## 相关内容 {#related-content}

- [ClickHouse 主索引实用介绍](/guides/best-practices/sparse-primary-indexes#option-3-projections)
- [物化视图](/docs/materialized-views)
- [ALTER PROJECTION](/sql-reference/statements/alter/projection)
