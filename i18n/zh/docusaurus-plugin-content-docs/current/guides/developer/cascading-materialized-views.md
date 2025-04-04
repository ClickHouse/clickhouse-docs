---
slug: /guides/developer/cascading-materialized-views
title: 级联物化视图
description: 如何使用多个物化视图从源表中获取数据。
keywords: ['物化视图', '聚合']
---


# 级联物化视图

此示例演示如何创建一个物化视图，然后如何在第一个物化视图上级联第二个物化视图。在本页面中，您将看到如何进行操作、许多可能性以及限制。通过使用第二个物化视图作为源创建物化视图，可以解决不同的用例。

<div style={{width:'640px', height: '360px'}}>
  <iframe src="//www.youtube.com/embed/QDAJTKZT8y4"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

<br />

示例：

我们将使用一个虚构的数据集，展示一组域名每小时的浏览次数。

我们的目标

1. 我们需要按月对每个域名的数据进行聚合，
2. 我们还需要按年对每个域名的数据进行聚合。

您可以选择以下选项之一：

- 编写查询，在 SELECT 请求期间读取并聚合数据
- 在摄取时间将数据准备为一种新格式
- 在摄取时间将数据准备为特定的聚合。

使用物化视图准备数据将允许您限制 ClickHouse 需要处理的数据和计算量，使您的 SELECT 请求更快。

## 物化视图的源表 {#source-table-for-the-materialized-views}

创建源表，因为我们的目标涉及对聚合数据的报告而非单个行，我们可以解析它，将信息传递给物化视图，并丢弃实际的输入数据。这满足了我们的目标并节省了存储，因此我们将使用 `Null` 表引擎。

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
您可以在 Null 表上创建物化视图。因此，写入表的数据最终将影响视图，但原始原始数据仍将被丢弃。
:::

## 月度聚合表和物化视图 {#monthly-aggregated-table-and-materialized-view}

对于第一个物化视图，我们需要创建 `Target` 表，在这个示例中，它将是 `analytics.monthly_aggregated_data`，我们将按月和域名存储浏览次数之和。

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

将数据转发到目标表的物化视图将如下所示：

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

## 年度聚合表和物化视图 {#yearly-aggregated-table-and-materialized-view}

现在我们将创建第二个物化视图，该视图将链接到之前的目标表 `monthly_aggregated_data`。

首先，我们将创建一个新的目标表，该表将存储按年聚合的浏览次数之和。

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

此步骤定义了级联。 `FROM` 语句将使用 `monthly_aggregated_data` 表，这意味着数据流将是：

1. 数据进入 `hourly_data` 表。
2. ClickHouse 将转发接收到的数据到第一个物化视图 `monthly_aggregated_data` 表，
3. 最后，第2步接收到的数据将转发到 `year_aggregated_data`。

```sql
CREATE MATERIALIZED VIEW analytics.year_aggregated_data_mv
TO analytics.year_aggregated_data
AS
SELECT
    toYear(toStartOfYear(month)) AS year,
    domain_name,
    sumMerge(sumCountViews) as sumCountViews
FROM analytics.monthly_aggregated_data
GROUP BY
    domain_name,
    year
```

:::note
在使用物化视图时，一个常见的误解是数据是从表中读取的。这不是 `物化视图` 的工作方式；转发的数据是插入块，而不是您表中的最终结果。

让我们想象在此示例中，`monthly_aggregated_data` 中使用的引擎是 CollapsingMergeTree，转发到我们第二个物化视图 `year_aggregated_data_mv` 的数据将不是已折叠表的最终结果，而是转发具有在 `SELECT ... GROUP BY` 中定义的字段数据块。

如果您使用 CollapsingMergeTree、ReplacingMergeTree，或者甚至是 SummingMergeTree，并且计划创建级联物化视图，您需要理解在此处描述的限制。
:::

## 示例数据 {#sample-data}

现在是插入一些数据以测试我们的级联物化视图的时候了：

```sql
INSERT INTO analytics.hourly_data (domain_name, event_time, count_views)
VALUES ('clickhouse.com', '2019-01-01 10:00:00', 1),
       ('clickhouse.com', '2019-02-02 00:00:00', 2),
       ('clickhouse.com', '2019-02-01 00:00:00', 3),
       ('clickhouse.com', '2020-01-01 00:00:00', 6);
```

如果您 SELECT `analytics.hourly_data` 的内容，您会看到以下内容，因为表引擎是 `Null`，但数据已被处理。

```sql
SELECT * FROM analytics.hourly_data
```

```response
Ok.

0 rows in set. Elapsed: 0.002 sec.
```

我们使用了一个小数据集，以确保我们可以跟踪和比较结果与我们的期望。一旦您的流与小数据集正确，您可以直接转到大量数据。

## 结果 {#results}

如果您尝试通过选择 `sumCountViews` 字段查询目标表，您将看到二进制表示（在某些终端中），因为该值并不是以数字存储，而是作为 AggregateFunction 类型。
要获得聚合的最终结果，您应该使用 `-Merge` 后缀。

您可以使用以下查询查看存储在 AggregateFunction 中的特殊字符：

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

相反，让我们尝试使用 `Merge` 后缀来获取 `sumCountViews` 值：

```sql
SELECT
   sumMerge(sumCountViews) as sumCountViews
FROM analytics.monthly_aggregated_data;
```

```response
┌─sumCountViews─┐
│            12 │
└───────────────┘

1 row in set. Elapsed: 0.003 sec.
```

在 `AggregatingMergeTree` 中，我们将 `AggregateFunction` 定义为 `sum`，因此我们可以使用 `sumMerge`。当我们在 `AggregateFunction` 上使用 `avg` 函数时，我们将使用 `avgMerge`，依此类推。

```sql
SELECT
    month,
    domain_name,
    sumMerge(sumCountViews) as sumCountViews
FROM analytics.monthly_aggregated_data
GROUP BY
    domain_name,
    month
```

现在我们可以审核物化视图是否满足我们定义的目标。

现在我们已经在目标表 `monthly_aggregated_data` 中存储了数据，我们可以获取按月对每个域名聚合的数据：

```sql
SELECT
   month,
   domain_name,
   sumMerge(sumCountViews) as sumCountViews
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

按年聚合每个域名的数据：

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

物化视图还可以用于将多个源表合并到同一个目标表中。这对于创建一个类似于 `UNION ALL` 逻辑的物化视图非常有用。

首先，创建两个源表，表示不同集合的指标：

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

然后使用合并后的指标集创建 `Target` 表：

```sql
CREATE TABLE analytics.daily_overview
(
    `on_date` Date,
    `domain_name` String,
    `impressions` SimpleAggregateFunction(sum, UInt64),
    `clicks` SimpleAggregateFunction(sum, UInt64)
) ENGINE = AggregatingMergeTree ORDER BY (on_date, domain_name)
```

创建两个指向相同 `Target` 表的物化视图。您不需要显式包含缺失的列：

```sql
CREATE MATERIALIZED VIEW analytics.daily_impressions_mv
TO analytics.daily_overview
AS                                                
SELECT
    toDate(event_time) AS on_date,
    domain_name,
    count() AS impressions,
    0 clicks         ---<<<--- 如果您省略这一行，则将默认为 0
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
    0 impressions    ---<<<--- 如果您省略这一行，则将默认为 0
FROM
    analytics.clicks
GROUP BY
    toDate(event_time) AS on_date,
    domain_name
;
```

现在，当您插入值时，这些值将根据其各自的列聚合到 `Target` 表中：

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

`Target` 表中组合的浏览次数和点击次数：

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

此查询应输出如下内容：

```response
┌────on_date─┬─domain_name────┬─impressions─┬─clicks─┐
│ 2019-01-01 │ clickhouse.com │           2 │      2 │
│ 2019-03-01 │ clickhouse.com │           1 │      1 │
│ 2019-02-01 │ clickhouse.com │           1 │      0 │
└────────────┴────────────────┴─────────────┴────────┘

3 rows in set. Elapsed: 0.018 sec.
```
