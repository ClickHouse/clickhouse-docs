---
slug: /guides/developer/cascading-materialized-views
title: '级联物化视图'
description: '如何在单个源表上使用多个物化视图。'
keywords: ['物化视图', '聚合']
doc_type: 'guide'
---

# 级联物化视图 {#cascading-materialized-views}

本示例演示如何创建一个物化视图，然后在其基础上再级联创建第二个物化视图。在本页中，你将看到具体操作步骤、多种可能的使用方式以及相应的限制。针对不同用例，可以通过创建一个以另一个物化视图作为数据源的物化视图来实现。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/QDAJTKZT8y4?si=1KqPNHHfaKfxtPat" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

<br />

示例：

我们将使用一个虚构的数据集，其中包含一组域名按小时统计的浏览次数。

我们的目标是：

1. 按月为每个域名聚合数据，
2. 按年为每个域名聚合数据。

你可以选择以下选项之一：

* 编写在 `SELECT` 请求期间读取并聚合数据的查询
* 在数据摄取时将数据预处理为新格式
* 在数据摄取时将数据预处理为特定聚合形式。

使用物化视图来预处理数据可以减少 ClickHouse 需要处理的数据量和计算量，从而加快你的 `SELECT` 请求。

## 物化视图的源表 {#source-table-for-the-materialized-views}

创建源表。因为我们的目标是对聚合后的数据进行报表分析，而不是保留每一条原始记录，我们可以对传入数据进行解析，将信息传递给物化视图，然后丢弃实际的原始数据。这样既能满足我们的目标，又能节省存储空间，因此我们将使用 `Null` 表引擎。

```sql
CREATE DATABASE IF NOT EXISTS analytics;
```

```sql
CREATE TABLE analytics.hourly_data
(
    `domain_name` String,
    `event_time` DateTime,
    `count_views` UInt64
)
ENGINE = Null
```

:::note
你可以在 Null 表上创建物化视图。这样写入该表的数据会影响视图，但原始数据本身仍然会被丢弃。
:::

## 每月聚合表和物化视图 {#monthly-aggregated-table-and-materialized-view}

对于第一个物化视图，我们需要先创建 `Target` 表。本例中，该表为 `analytics.monthly_aggregated_data`，用于按月份和域名存储浏览次数的总和。

```sql
CREATE TABLE analytics.monthly_aggregated_data
(
    `domain_name` String,
    `month` Date,
    `sumCountViews` AggregateFunction(sum, UInt64)
)
ENGINE = AggregatingMergeTree
ORDER BY (domain_name, month)
```

用于将数据转发到目标表的物化视图如下所示：

```sql
CREATE MATERIALIZED VIEW analytics.monthly_aggregated_data_mv
TO analytics.monthly_aggregated_data
AS
SELECT
    toDate(toStartOfMonth(event_time)) AS month,
    domain_name,
    sumState(count_views) AS sumCountViews
FROM analytics.hourly_data
GROUP BY
    domain_name,
    month
```

## 按年聚合的表和物化视图 {#yearly-aggregated-table-and-materialized-view}

现在我们将创建第二个物化视图，它将关联到我们之前的目标表 `monthly_aggregated_data`。

首先，我们将创建一个新的目标表，用于存储每个域名按年份聚合后的访问量总和。

```sql
CREATE TABLE analytics.year_aggregated_data
(
    `domain_name` String,
    `year` UInt16,
    `sumCountViews` UInt64
)
ENGINE = SummingMergeTree()
ORDER BY (domain_name, year)
```

此步骤定义了级联关系。`FROM` 语句将使用 `monthly_aggregated_data` 表，这意味着数据流如下：

1. 数据首先进入 `hourly_data` 表。
2. ClickHouse 会将接收到的数据转发到第一个物化视图 `monthly_aggregated_data` 表中，
3. 最后，第 2 步中接收到的数据会被转发到 `year_aggregated_data` 表。

```sql
CREATE MATERIALIZED VIEW analytics.year_aggregated_data_mv
TO analytics.year_aggregated_data
AS
SELECT
    toYear(toStartOfYear(month)) AS year,
    domain_name,
    sumMerge(sumCountViews) AS sumCountViews
FROM analytics.monthly_aggregated_data
GROUP BY
    domain_name,
    year
```

:::note
在使用物化视图时，一个常见的误解是认为物化视图是从表中读取数据的。`Materialized views` 并不是这样工作的；被转发的数据是插入时的那个数据块，而不是表中的最终结果数据。

在本示例中，假设 `monthly_aggregated_data` 使用的引擎是 CollapsingMergeTree，则转发到第二个物化视图 `year_aggregated_data_mv` 的数据并不是折叠后的表的最终结果，而是包含按照 `SELECT ... GROUP BY` 中定义字段的那一批数据块。

如果你使用的是 CollapsingMergeTree、ReplacingMergeTree 或 SummingMergeTree，并且计划创建级联物化视图，那么你需要了解此处描述的这些限制。
:::

## 示例数据 {#sample-data}

现在我们可以通过插入一些数据来测试我们的级联物化视图：

```sql
INSERT INTO analytics.hourly_data (domain_name, event_time, count_views)
VALUES ('clickhouse.com', '2019-01-01 10:00:00', 1),
       ('clickhouse.com', '2019-02-02 00:00:00', 2),
       ('clickhouse.com', '2019-02-01 00:00:00', 3),
       ('clickhouse.com', '2020-01-01 00:00:00', 6);
```

如果对 `analytics.hourly_data` 执行 SELECT 查询，你会看到如下内容，这是因为该表的引擎为 `Null`，但数据已经被处理。

```sql
SELECT * FROM analytics.hourly_data
```

```response
Ok.

0 rows in set. Elapsed: 0.002 sec.
```

我们使用了一个小型数据集，以便能够跟踪结果并与预期进行对比。一旦您在小数据集上的流程验证无误，就可以扩展到处理更大规模的数据。

## 结果 {#results}

如果你尝试通过选择 `sumCountViews` 字段来查询目标表，在某些终端中会看到其二进制形式，因为该值不是以数字形式存储的，而是作为 AggregateFunction 类型存储的。
要获得聚合的最终结果，你应使用 `-Merge` 后缀。

你可以通过以下查询查看存储在 AggregateFunction 中的特殊字符：

```sql
SELECT sumCountViews FROM analytics.monthly_aggregated_data
```

```response
┌─sumCountViews─┐
│               │
│               │
│               │
└───────────────┘

3 rows in set. Elapsed: 0.003 sec.
```

那么，我们试试用 `Merge` 后缀来获取 `sumCountViews` 的值：

```sql
SELECT
   sumMerge(sumCountViews) AS sumCountViews
FROM analytics.monthly_aggregated_data;
```

```response
┌─sumCountViews─┐
│            12 │
└───────────────┘

1 row in set. Elapsed: 0.003 sec.
```

在 `AggregatingMergeTree` 中，我们将 `AggregateFunction` 定义为 `sum`，因此可以使用 `sumMerge`。当我们对 `AggregateFunction` 使用函数 `avg` 时，则会使用 `avgMerge`，以此类推。

```sql
SELECT
    month,
    domain_name,
    sumMerge(sumCountViews) AS sumCountViews
FROM analytics.monthly_aggregated_data
GROUP BY
    domain_name,
    month
```

现在我们可以验证这些物化视图是否满足我们之前定义的目标。

现在数据已经存储在目标表 `monthly_aggregated_data` 中，可以按月份获取每个域名的聚合数据：

```sql
SELECT
   month,
   domain_name,
   sumMerge(sumCountViews) AS sumCountViews
FROM analytics.monthly_aggregated_data
GROUP BY
   domain_name,
   month
```

```response
┌──────month─┬─domain_name────┬─sumCountViews─┐
│ 2020-01-01 │ clickhouse.com │             6 │
│ 2019-01-01 │ clickhouse.com │             1 │
│ 2019-02-01 │ clickhouse.com │             5 │
└────────────┴────────────────┴───────────────┘

3 rows in set. Elapsed: 0.004 sec.
```

按年份汇总的各域名数据：

```sql
SELECT
   year,
   domain_name,
   sum(sumCountViews)
FROM analytics.year_aggregated_data
GROUP BY
   domain_name,
   year
```

```response
┌─year─┬─domain_name────┬─sum(sumCountViews)─┐
│ 2019 │ clickhouse.com │                  6 │
│ 2020 │ clickhouse.com │                  6 │
└──────┴────────────────┴────────────────────┘

2 rows in set. Elapsed: 0.004 sec.
```

## 将多个源表合并到单个目标表 {#combining-multiple-source-tables-to-single-target-table}

物化视图也可以用于将多个源表合并到同一个目标表中。这对于创建类似 `UNION ALL` 逻辑的物化视图非常有用。

首先，创建两个源表来表示不同的指标集合：

```sql
CREATE TABLE analytics.impressions
(
    `event_time` DateTime,
    `domain_name` String
) ENGINE = MergeTree ORDER BY (domain_name, event_time)
;

CREATE TABLE analytics.clicks
(
    `event_time` DateTime,
    `domain_name` String
) ENGINE = MergeTree ORDER BY (domain_name, event_time)
;
```

然后创建包含合并后指标集的 `Target` 表：

```sql
CREATE TABLE analytics.daily_overview
(
    `on_date` Date,
    `domain_name` String,
    `impressions` SimpleAggregateFunction(sum, UInt64),
    `clicks` SimpleAggregateFunction(sum, UInt64)
) ENGINE = AggregatingMergeTree ORDER BY (on_date, domain_name)
```

创建两个指向同一个 `Target` 表的物化视图。你不需要显式包含缺失的列：

```sql
CREATE MATERIALIZED VIEW analytics.daily_impressions_mv
TO analytics.daily_overview
AS
SELECT
    toDate(event_time) AS on_date,
    domain_name,
    count() AS impressions,
    0 clicks         ---<<<--- if you omit this, it will be the same 0
FROM
    analytics.impressions
GROUP BY
    toDate(event_time) AS on_date,
    domain_name
;

CREATE MATERIALIZED VIEW analytics.daily_clicks_mv
TO analytics.daily_overview
AS
SELECT
    toDate(event_time) AS on_date,
    domain_name,
    count() AS clicks,
    0 impressions    ---<<<--- if you omit this, it will be the same 0
FROM
    analytics.clicks
GROUP BY
    toDate(event_time) AS on_date,
    domain_name
;
```

现在，当你插入数据时，这些值会被聚合到 `Target` 表中各自对应的列中：

```sql
INSERT INTO analytics.impressions (domain_name, event_time)
VALUES ('clickhouse.com', '2019-01-01 00:00:00'),
       ('clickhouse.com', '2019-01-01 12:00:00'),
       ('clickhouse.com', '2019-02-01 00:00:00'),
       ('clickhouse.com', '2019-03-01 00:00:00')
;

INSERT INTO analytics.clicks (domain_name, event_time)
VALUES ('clickhouse.com', '2019-01-01 00:00:00'),
       ('clickhouse.com', '2019-01-01 12:00:00'),
       ('clickhouse.com', '2019-03-01 00:00:00')
;
```

在 `Target` 表中将展示量与点击量合并在一起：

```sql
SELECT
    on_date,
    domain_name,
    sum(impressions) AS impressions,
    sum(clicks) AS clicks
FROM
    analytics.daily_overview
GROUP BY
    on_date,
    domain_name
;
```

此查询应输出类似如下的结果：

```response
┌────on_date─┬─domain_name────┬─impressions─┬─clicks─┐
│ 2019-01-01 │ clickhouse.com │           2 │      2 │
│ 2019-03-01 │ clickhouse.com │           1 │      1 │
│ 2019-02-01 │ clickhouse.com │           1 │      0 │
└────────────┴────────────────┴─────────────┴────────┘

3 rows in set. Elapsed: 0.018 sec.
```
