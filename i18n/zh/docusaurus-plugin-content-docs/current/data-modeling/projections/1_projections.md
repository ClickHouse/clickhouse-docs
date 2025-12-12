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

# 投影 {#projections}

## 简介 {#introduction}

ClickHouse 为实时场景下的大规模数据分析查询提供了多种加速机制。其中一种是使用 _Projections（投影）_ 来加速查询。Projections 通过根据关注的属性对数据进行重新排序来帮助优化查询，具体可以是：

1. 对整个数据进行完全重新排序
2. 原始表的一个子集，但采用不同的排序方式
3. 预计算的聚合结果（类似于物化视图），并且其排序方式
   与聚合维度对齐。

<br/>

<iframe width="560" height="315" src="https://www.youtube.com/embed/6CdnUdZSEG0?si=1zUyrP-tCvn9tXse" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Projections 如何工作？ {#how-do-projections-work}

在实践中，可以将 Projection 看作是原始表的一个额外的隐藏表。Projection 可以拥有与原始表不同的行顺序，因此也可以拥有不同的主索引，并且它可以自动、增量地预计算聚合值。因此，使用 Projections 可以通过两个“调优手段”来加速查询执行：

- **正确使用主索引**
- **预计算聚合**

Projections 在某些方面类似于 [物化视图](/materialized-views)
，它们同样允许你使用多种行顺序，并在插入时预计算聚合。
Projections 会自动更新，并与原始表保持同步；这与物化视图（Materialized Views）不同，后者需要显式更新。当查询针对原始表时，
ClickHouse 会自动对主键进行采样，并选择一个既能生成相同正确结果、又需要读取数据量最少的表，如下图所示：

<Image img={projections_1} size="md" alt="ClickHouse 中的 Projections"/>

### 使用 `_part_offset` 的更智能存储 {#smarter_storage_with_part_offset}

从 25.5 版本开始，ClickHouse 在 projection 中支持虚拟列 `_part_offset`，这为定义 projection 提供了一种新的方式。

现在有两种定义 projection 的方式：

- **存储完整列（原有行为）**：projection 包含完整数据，可以被直接读取，当过滤条件与 projection 的排序顺序匹配时，可以获得更快的查询性能。

- **仅存储排序键 + `_part_offset`**：projection 的工作方式类似索引。
  ClickHouse 使用 projection 的主索引来定位匹配的行，但从基表中读取实际数据。
  这样可以减少存储开销，但在查询时会略微增加 I/O。

上述方法也可以混合使用，在 projection 中直接存储部分列，而通过 `_part_offset` 间接存储其他列。

## 何时使用 Projections？ {#when-to-use-projections}

Projections 对新用户而言非常有吸引力，因为它们会在数据插入时自动维护。并且，查询只需发送到单个表，并在可能时利用 projections 来加速响应时间。

这与物化视图不同，后者要求用户根据过滤条件选择适当的已优化目标表，或者重写查询。这会对用户应用提出更高要求，并增加客户端的复杂度。

尽管有这些优点，projections 也存在一些固有限制，用户应当了解这些限制，因此应谨慎使用，避免过度依赖。

- Projections 不允许对源表和（隐藏的）目标表使用不同的 TTL，而物化视图允许使用不同的 TTL。
- 对包含 projections 的表，不支持轻量级更新和删除。
- 物化视图可以链式使用：一个物化视图的目标表可以作为另一个物化视图的源表，依此类推。而 projections 无法做到这一点。
- Projection 定义不支持 join，但物化视图支持。不过，对包含 projections 的表进行的查询可以自由使用 join。
- Projection 定义不支持过滤条件（`WHERE` 子句），但物化视图支持。不过，对包含 projections 的表进行的查询可以自由使用过滤条件。

我们建议在以下场景使用 projections：

- 需要对数据进行完全重新排序时。虽然理论上，projection 中的表达式可以使用 `GROUP BY`，但物化视图在维护聚合方面更有效。查询优化器也更有可能利用仅做简单重排的 projections，即 `SELECT * ORDER BY x`。用户可以在该表达式中选择列的子集，以减少存储占用。
- 用户能够接受可能带来的存储占用增加，以及将数据写入两次的额外开销时。请测试其对插入速度的影响，并[评估存储开销](/data-compression/compression-in-clickhouse)。

## 示例 {#examples}

### 在非主键列上进行过滤 {#filtering-without-using-primary-keys}

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

Notice that because we are filtering on `tip_amount` which is not in the `ORDER BY`, ClickHouse 
had to do a full table scan. Let's speed this query up.

So as to preserve the original table and results, we'll create a new table and copy the data using an `INSERT INTO SELECT`:

```sql
CREATE TABLE nyc_taxi.trips_with_projection AS nyc_taxi.trips;
INSERT INTO nyc_taxi.trips_with_projection SELECT * FROM nyc_taxi.trips;
```

To add a projection we use the `ALTER TABLE` statement together with the `ADD PROJECTION`
statement:

```sql
ALTER TABLE nyc_taxi.trips_with_projection
ADD PROJECTION prj_tip_amount
(
    SELECT *
    ORDER BY tip_amount, dateDiff('minutes', pickup_datetime, dropoff_datetime)
)
```

It is necessary after adding a projection to use the `MATERIALIZE PROJECTION` 
statement so that the data in it is physically ordered and rewritten according
to the specified query above:

```sql
ALTER TABLE nyc.trips_with_projection MATERIALIZE PROJECTION prj_tip_amount
```

Let's run the query again now that we've added the projection:

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips_with_projection WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

Notice how we were able to decrease the query time substantially, and needed to scan
less rows.

We can confirm that our query above did indeed use the projection we made by
querying the `system.query_log` table:

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

To demonstrate how projections can be used to speed up query performance, let's
take a look at an example using a real life dataset. For this example we'll be 
using the table from our [UK Property Price Paid](https://clickhouse.com/docs/getting-started/example-datasets/uk-price-paid)
tutorial with 30.03 million rows. This dataset is also available within our 
[sql.clickhouse.com](https://sql.clickhouse.com/?query_id=6IDMHK3OMR1C97J6M9EUQS)
environment.

If you would like to see how the table was created and data inserted, you can
refer to ["The UK property prices dataset"](/getting-started/example-datasets/uk-price-paid)
page.

We can run two simple queries on this dataset. The first lists the counties in London which
have the highest prices paid, and the second calculates the average price for the counties:

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

Notice that despite being very fast how a full table scan of all 30.03 million rows occurred for both queries, due 
to the fact that neither `town` nor `price` were in our `ORDER BY` statement when we
created the table:

```sql
CREATE TABLE uk.uk_price_paid
(
  ...
)
ENGINE = MergeTree
--highlight-next-line
ORDER BY (postcode1, postcode2, addr1, addr2);
```

Let's see if we can speed this query up using projections.

To preserve the original table and results, we'll create a new table and copy the data using an `INSERT INTO SELECT`:

```sql
CREATE TABLE uk.uk_price_paid_with_projections AS uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections SELECT * FROM uk.uk_price_paid;
```

We create and populate projection `prj_oby_town_price` which produces an 
additional (hidden) table with a primary index, ordering by town and price, to 
optimize the query that lists the counties in a specific town for the highest 
paid prices:

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

The [`mutations_sync`](/operations/settings/settings#mutations_sync) setting is
used to force synchronous execution.

We create and populate projection `prj_gby_county` – an additional (hidden) table
that incrementally pre-computes the avg(price) aggregate values for all existing
130 UK counties:

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
If there is a `GROUP BY` clause used in a projection like in the `prj_gby_county`
projection above, then the underlying storage engine for the (hidden) table 
becomes `AggregatingMergeTree`, and all aggregate functions are converted to 
`AggregateFunction`. This ensures proper incremental data aggregation.
:::

The figure below is a visualization of the main table `uk_price_paid_with_projections`
and its two projections:

<Image img={projections_2} size="md" alt="Visualization of the main table uk_price_paid_with_projections and its two projections"/>

If we now run the query that lists the counties in London for the three highest 
paid prices again, we see an improvement in query performance:

```sql runnable
SELECT
  county,
  price
FROM uk.uk_price_paid_with_projections
WHERE town = 'LONDON'
ORDER BY price DESC
LIMIT 3
```

Likewise, for the query that lists the U.K. counties with the three highest 
average-paid prices:

```sql runnable
SELECT
    county,
    avg(price)
FROM uk.uk_price_paid_with_projections
GROUP BY county
ORDER BY avg(price) DESC
LIMIT 3
```

Note that both queries target the original table, and that both queries resulted
in a full table scan (all 30.03 million rows got streamed from disk) before we 
created the two projections.

Also, note that the query that lists the counties in London for the three highest
paid prices is streaming 2.17 million rows. When we directly used a second table
optimized for this query, only 81.92 thousand rows were streamed from disk.

The reason for the difference is that currently, the `optimize_read_in_order` 
optimization mentioned above isn't supported for projections.

We inspect the `system.query_log` table to see that ClickHouse 
automatically used the two projections for the two queries above (see the 
projections column below):

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

### Further examples {#further-examples}

The following examples use the same UK price dataset, contrasting queries with and without projections.

In order to preserve our original table (and performance), we again create a copy of the table using `CREATE AS` and `INSERT INTO SELECT`.

```sql
CREATE TABLE uk.uk_price_paid_with_projections_v2 AS uk.uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections_v2 SELECT * FROM uk.uk_price_paid;
```

#### Build a Projection {#build-projection}

Let's create an aggregate projection by the dimensions `toYear(date)`, `district`, and `town`:

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

Populate the projection for existing data. (Without materializing it, the projection will be created for only newly inserted data):

```sql
ALTER TABLE uk.uk_price_paid_with_projections_v2
    MATERIALIZE PROJECTION projection_by_year_district_town
SETTINGS mutations_sync = 1
```

The following queries contrast performance with and without projections. To disable projection use we use the setting [`optimize_use_projections`](/operations/settings/settings#optimize_use_projections), which is enabled by default.

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
The results should be the same, but the performance better on the latter example!

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

The condition (date >= '2020-01-01') needs to be modified so that it matches the projection dimension (`toYear(date) >= 2020)`:

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

Again, the result is the same but notice the improvement in query performance for the 2nd query.

### Combining projections in one query {#combining-projections}

Starting in version 25.6, building on the `_part_offset` support introduced in 
the previous version, ClickHouse can now use multiple projections to accelerate 
a single query with multiple filters.

Importantly, ClickHouse still reads data from only one projection (or the base table), 
but can use other projections' primary indexes to prune unnecessary parts before reading.
This is especially useful for queries that filter on multiple columns, each 
potentially matching a different projection.

> Currently, this mechanism only prunes entire parts. Granule-level pruning is 
  not yet supported.

To demonstrate this, we define the table (with projections using `_part_offset` columns)
and insert five example rows matching the diagrams above.

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

Then we insert data into the table:

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
Note: The table uses custom settings for illustration, such as one-row granules 
and disabled part merges, which are not recommended for production use.
:::

This setup produces:
- Five separate parts (one per inserted row)
- One primary index entry per row (in the base table and each projection)
- Each part contains exactly one row

With this setup, we run a query filtering on both `region` and `user_id`. 
Since the base table’s primary index is built from `event_date` and `id`, it
is unhelpful here, ClickHouse therefore uses:

- `region_proj` to prune parts by region
- `user_id_proj` to further prune by `user_id`

This behavior is visible using `EXPLAIN projections = 1`, which shows how 
ClickHouse selects and applies projections.

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

## 相关内容 {#related-content}

- [ClickHouse 主键索引实用入门指南](/guides/best-practices/sparse-primary-indexes#option-3-projections)
- [物化视图](/docs/materialized-views)
- [ALTER PROJECTION](/sql-reference/statements/alter/projection)