---
'slug': '/data-modeling/projections'
'title': '投影'
'description': '页面描述投影是什么，它们如何用于提高查询性能，以及它们与物化视图的不同。'
'keywords':
- 'projection'
- 'projections'
- 'query optimization'
'sidebar_order': 1
'doc_type': 'guide'
---

import projections_1 from '@site/static/images/data-modeling/projections_1.png';
import projections_2 from '@site/static/images/data-modeling/projections_2.png';
import Image from '@theme/IdealImage';


# Projections

## Introduction {#introduction}

ClickHouse 提供了多种加速实时场景下大规模数据分析查询的机制。其中一种加速查询的机制是通过使用 _Projections_。Projections 通过按相关属性重排数据来帮助优化查询。这可以是：

1. 完全重排
2. 原始表的一个子集，但顺序不同
3. 预计算聚合（类似于物化视图），但与聚合对齐的排序。

<br/>
<iframe width="560" height="315" src="https://www.youtube.com/embed/6CdnUdZSEG0?si=1zUyrP-tCvn9tXse" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## How do Projections work? {#how-do-projections-work}

实际上，Projection 可以被视为原始表的一个附加的、隐藏的表。Projection 可以具有不同于原始表的行顺序，因此可以有不同的主索引，并且它可以自动和增量地预计算聚合值。因此，使用 Projections 提供了两个加速查询执行的“调节旋钮”：

- **正确使用主索引**
- **预计算聚合**

Projections 在某种程度上类似于 [Materialized Views](/materialized-views)，它们也允许您在插入时维护多个行顺序和预计算聚合。Projections 是自动更新并与原始表保持同步的，这与物化视图不同，后者是显式更新的。当查询针对原始表时，ClickHouse 会自动抽样主键并选择一个可以生成相同正确结果的表，但读取所需的数据最少，如下图所示：

<Image img={projections_1} size="md" alt="Projections in ClickHouse"/>

### Smarter storage with `_part_offset` {#smarter_storage_with_part_offset}

自 25.5 版本以来，ClickHouse 在 Projections 中支持虚拟列 `_part_offset`，这提供了一种新的定义 Projection 的方法。

现在定义 Projection 有两种方式：

- **存储完整列（原始行为）**：Projection 包含完整数据并可以直接读取，当过滤条件与 Projection 的排序顺序匹配时，性能更快。

- **只存储排序键 + `_part_offset`**：Projection 的工作方式类似于索引。ClickHouse 使用 Projection 的主索引来定位匹配行，但从基础表中读取实际数据。这在插入时会减少存储开销，但在查询时会略微增加 I/O。

上述方法也可以混合使用，在 Projection 中存储某些列，并通过 `_part_offset` 间接存储其他列。

## When to use Projections? {#when-to-use-projections}

Projections 对新用户来说是一个吸引人的特性，因为它们在数据插入时会自动维护。此外，查询可以仅发送到一个表，在可能的情况下利用 Projections 来加速响应时间。

这与物化视图形成对比，后者要求用户选择适当的优化目标表或根据过滤器重写查询。这使得用户应用程序的复杂性提高，并增加了客户端的复杂度。

尽管有这些优势，Projections 也有一些固有的限制，用户应该意识到，因此应谨慎使用。

- Projections 不允许对源表和（隐藏的）目标表使用不同的 TTL，而物化视图允许不同的 TTL。
- 对于包含 Projections 的表，不支持轻量级更新和删除。
- 物化视图可以链式使用：一个物化视图的目标表可以成为另一个物化视图的源表，等等。这在 Projections 中是不可能的。
- Projections 不支持连接，但物化视图支持。
- Projections 不支持过滤（`WHERE` 子句），但物化视图支持。

我们推荐在以下情况下使用 Projections：

- 需要对数据进行完全重排。虽然 Projection 中的表达式理论上可以使用 `GROUP BY`，但物化视图在维护聚合方面更有效。查询优化器更有可能利用使用简单重排的 Projections，即 `SELECT * ORDER BY x`。用户可以选择此表达式中的子集列以减少存储占用。
- 用户能够接受潜在的存储占用和重写数据两次的开销。测试插入速度的影响并 [评估存储开销](/data-compression/compression-in-clickhouse)。

## Examples {#examples}

### Filtering on columns which aren't in the primary key {#filtering-without-using-primary-keys}

在本例中，我们将向您展示如何向表中添加一个 Projection。我们还将看一下 Projection 如何用于加速过滤在表的主键中不存在的列的查询。

在此示例中，我们将使用可在 [sql.clickhouse.com](https://sql.clickhouse.com/) 上找到的纽约出租车数据集，该数据集按 `pickup_datetime` 排序。

让我们写一个简单的查询，以查找所有小费大于 $200 的行程 ID：

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

请注意，由于我们过滤的是不在 `ORDER BY` 中的 `tip_amount`，ClickHouse 必须进行完整表扫描。让我们加速这个查询。

为了保留原始表和结果，我们将创建一个新表并使用 `INSERT INTO SELECT` 复制数据：

```sql
CREATE TABLE nyc_taxi.trips_with_projection AS nyc_taxi.trips;
INSERT INTO nyc_taxi.trips_with_projection SELECT * FROM nyc_taxi.trips;
```

要添加一个 Projection，我们使用 `ALTER TABLE` 语句和 `ADD PROJECTION` 语句：

```sql
ALTER TABLE nyc_taxi.trips_with_projection
ADD PROJECTION prj_tip_amount
(
    SELECT *
    ORDER BY tip_amount, dateDiff('minutes', pickup_datetime, dropoff_datetime)
)
```

在添加 Projection 后，有必要使用 `MATERIALIZE PROJECTION` 语句，以便使其中的数据按物理顺序排列并根据上述指定的查询重写：

```sql
ALTER TABLE nyc.trips_with_projection MATERIALIZE PROJECTION prj_tip_amount
```

添加了 Projection 后，让我们再次运行查询：

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips_with_projection WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

请注意，我们确实能够显著减少查询时间，并且需要扫描更少的行。

我们可以通过查询 `system.query_log` 表来确认上述查询确实使用了我们创建的 Projection：

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

为了演示如何使用 Projections 加速查询性能，让我们看看一个使用真实数据集的示例。在此示例中，我们将使用来自我们 [UK Property Price Paid](https://clickhouse.com/docs/getting-started/example-datasets/uk-price-paid) 教程的表，该表包含 3003 万行。该数据集也可在我们的 [sql.clickhouse.com](https://sql.clickhouse.com/?query_id=6IDMHK3OMR1C97J6M9EUQS) 环境中找到。

如果您想查看如何创建表和插入数据，您可以参考 [“英国房价数据集”](/getting-started/example-datasets/uk-price-paid) 页面。

我们可以在此数据集上运行两个简单查询。第一个列出伦敦中支付价格最高的县，第二个计算各县的平均价格：

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

请注意，尽管这两个查询非常快速，但由于在创建表时 `town` 和 `price` 不在我们的 `ORDER BY` 语句中，因此进行了完整表扫描（所有 3003 万行均从磁盘流式传输）。

```sql
CREATE TABLE uk.uk_price_paid
(
  ...
)
ENGINE = MergeTree
--highlight-next-line
ORDER BY (postcode1, postcode2, addr1, addr2);
```

让我们看看是否可以使用 Projections 加速这个查询。

为了保留原始表和结果，我们将创建一个新表并使用 `INSERT INTO SELECT` 复制数据：

```sql
CREATE TABLE uk.uk_price_paid_with_projections AS uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections SELECT * FROM uk.uk_price_paid;
```

我们创建并填充 Projection `prj_oby_town_price`，它生成一个附加的（隐藏的）表，主索引按城市和价格排序，以优化列出特定城市支付最高价格的县的查询：

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

我们创建并填充 Projection `prj_gby_county` – 一个附加的（隐藏的）表，它增量地预计算所有现有 130 个英国县的 avg(price) 聚合值：

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
如果在 Projection 中使用了 `GROUP BY` 子句，例如在 `prj_gby_county` Projection 中，那么该（隐藏）表的底层存储引擎变为 `AggregatingMergeTree`，所有聚合函数被转换为 `AggregateFunction`。这确保了适当的增量数据聚合。
:::

下图是主要表 `uk_price_paid_with_projections` 及其两个 Projections 的可视化：

<Image img={projections_2} size="md" alt="Visualization of the main table uk_price_paid_with_projections and its two projections"/>

如果我们现在再次运行列出伦敦中支付最高价格的三县的查询，我们会看到查询性能有所改善：

```sql runnable
SELECT
  county,
  price
FROM uk.uk_price_paid_with_projections
WHERE town = 'LONDON'
ORDER BY price DESC
LIMIT 3
```

同样，对于列出支付平均价格最高的英国县的查询：

```sql runnable
SELECT
    county,
    avg(price)
FROM uk.uk_price_paid_with_projections
GROUP BY county
ORDER BY avg(price) DESC
LIMIT 3
```

请注意，这两个查询都针对原始表，并且在我们创建这两个 Projections 之前，这两个查询都导致了完整表扫描（所有 3003 万行均从磁盘流式传输）。

还要注意，列出伦敦中支付最高价格的三县的查询流式传输了 217 万行。当我们直接使用一个针对该查询优化的第二个表时，仅从磁盘流式传输了 81920 行。

差异的原因在于，目前，前面提到的 `optimize_read_in_order` 优化不支持 Projections。

我们检查 `system.query_log` 表，以查看 ClickHouse 自动对上述两个查询使用了两个 Projections（请参见下面的 Projections 列）：

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

以下示例使用相同的英国价格数据集，比较使用和不使用 Projections 的查询。

为了保留我们的原始表（和性能），我们再次使用 `CREATE AS` 和 `INSERT INTO SELECT` 创建表的副本。

```sql
CREATE TABLE uk.uk_price_paid_with_projections_v2 AS uk.uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections_v2 SELECT * FROM uk.uk_price_paid;
```

#### Build a Projection {#build-projection}

让我们按维度 `toYear(date)`、`district` 和 `town` 创建一个聚合 Projection：

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

为现有数据填充 Projection。（如果不物化，Projection 将仅为新插入的数据创建）：

```sql
ALTER TABLE uk.uk_price_paid_with_projections_v2
    MATERIALIZE PROJECTION projection_by_year_district_town
SETTINGS mutations_sync = 1
```

以下查询对比了使用和不使用 Projections 的性能。要禁用 Projection 使用，我们使用设置 [`optimize_use_projections`](/operations/settings/settings#optimize_use_projections)，该设置默认为启用。

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
结果应该是一样的，但后者示例的性能更好！

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

条件 (date >= '2020-01-01') 需要进行修改，以匹配 Projection 维度（`toYear(date) >= 2020`）：

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

同样，结果是一样的，但注意第二个查询的查询性能有所改善。

### Combining projections in one query {#combining-projections}

自 25.6 版本起，基于前一个版本中引入的 `_part_offset` 支持，ClickHouse 现在可以使用多个 Projections 来加速具有多个过滤器的单个查询。

重要的是，ClickHouse 仍然只从一个 Projection（或基础表）读取数据，但可以使用其他 Projections 的主索引在读取之前修剪不必要的部分。这对于过滤多个列的查询特别有用，每个列可能匹配不同的 Projection。

> 目前，这一机制仅修剪整个部分。粒度级别的修剪尚不支持。

为了演示这一点，我们定义表（使用 `_part_offset` 列的 Projections）并插入五个示例行以匹配上面的图示。

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

然后我们将数据插入表中：

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
注意：该表使用自定义设置进行说明，例如单行粒度和禁用分片合并，这些在生产使用中不推荐。
:::

这设置将产生：
- 五个单独的部分（每个插入行一个）
- 每行一个主索引条目（在基础表和每个 Projection 中）
- 每个部分包含恰好一行

有了这个设置，我们运行一个同时针对 `region` 和 `user_id` 过滤的查询。由于基础表的主索引是从 `event_date` 和 `id` 构建的，因此在这里没有用处，ClickHouse 因此使用：

- `region_proj` 按区域修剪部分
- `user_id_proj` 进一步按 `user_id` 修剪

这种行为可使用 `EXPLAIN projections = 1` 可见，它显示了 ClickHouse 如何选择和应用 Projections。

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
 6. │         Description: Projection has been analyzed and is used for part-level filtering │
 7. │         Condition: (region in ['us_west', 'us_west'])                                  │
 8. │         Search Algorithm: binary search                                                │
 9. │         Parts: 3                                                                       │
10. │         Marks: 3                                                                       │
11. │         Ranges: 3                                                                      │
12. │         Rows: 3                                                                        │
13. │         Filtered Parts: 2                                                              │
14. │       Name: user_id_proj                                                               │
15. │         Description: Projection has been analyzed and is used for part-level filtering │
16. │         Condition: (user_id in [107, 107])                                             │
17. │         Search Algorithm: binary search                                                │
18. │         Parts: 1                                                                       │
19. │         Marks: 1                                                                       │
20. │         Ranges: 1                                                                      │
21. │         Rows: 1                                                                        │
22. │         Filtered Parts: 2                                                              │
    └────────────────────────────────────────────────────────────────────────────────────────┘
```

`EXPLAIN` 输出（如上所示）揭示了逻辑查询计划，从上到下：

| 行号 | 描述                                                                                           |
|------|------------------------------------------------------------------------------------------------|
| 3    | 计划从 `page_views` 基础表读取                                                                |
| 5-13 | 使用 `region_proj` 识别 3 个区域为 'us_west' 的部分，修剪 5 个部分中的 2 个                    |
| 14-22| 使用 `user_id_proj` 识别 1 个部分，其中 `user_id = 107`，进一步修剪 3 个剩余部分中的 2 个 |

最后，从基础表中只读取 **5 个部分中的 1 个**。通过结合多个 Projections 的索引分析，ClickHouse 显著减少了扫描的数据量，提高了性能，同时保持低存储开销。

## Related content {#related-content}
- [ClickHouse 中主索引的实际介绍](/guides/best-practices/sparse-primary-indexes#option-3-projections)
- [物化视图](/docs/materialized-views)
- [ALTER PROJECTION](/sql-reference/statements/alter/projection)
