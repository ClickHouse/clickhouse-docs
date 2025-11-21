---
slug: /guides/developer/cascading-materialized-views
title: '级联物化视图'
description: '如何基于同一源表使用多个物化视图。'
keywords: ['物化视图', '聚合']
doc_type: 'guide'
---



# 级联物化视图

本示例演示如何创建一个物化视图，以及如何在第一个物化视图的基础上再级联创建第二个物化视图。在本页中，将介绍具体操作方法、各种可能的用法以及其局限性。通过使用一个物化视图作为另一个物化视图的源，可以满足不同的使用场景。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/QDAJTKZT8y4?si=1KqPNHHfaKfxtPat" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

<br />

示例：

我们将使用一个虚构的数据集，其中包含一组域名每小时的浏览次数。

我们的目标：

1. 需要对每个域名按月进行数据聚合，
2. 还需要对每个域名按年进行数据聚合。

可以选择以下方式之一：

- 编写在执行 SELECT 请求时读取并聚合数据的查询
- 在写入时将数据准备成一种新的格式
- 在写入时将数据预先准备成特定的聚合形式。

使用物化视图来预处理数据，可以减少 ClickHouse 需要处理的数据量和计算量，从而加快 SELECT 请求的执行。



## 物化视图的源表 {#source-table-for-the-materialized-views}

创建源表。由于我们的目标是对聚合数据进行报告而不是对单个行进行报告,因此我们可以解析数据,将信息传递给物化视图,然后丢弃实际传入的数据。这样既满足了我们的需求,又节省了存储空间,所以我们将使用 `Null` 表引擎。

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
您可以在 Null 表上创建物化视图。这样,写入表的数据最终会影响视图,但原始数据仍会被丢弃。
:::


## 月度聚合表和物化视图 {#monthly-aggregated-table-and-materialized-view}

对于第一个物化视图,我们需要创建目标表(`Target` 表),在本示例中为 `analytics.monthly_aggregated_data`,该表将按月份和域名存储浏览量的总和。

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

将数据转发到目标表的物化视图定义如下:

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

现在我们将创建第二个物化视图,它将关联到之前的目标表 `monthly_aggregated_data`。

首先,我们将创建一个新的目标表,用于存储每个域名按年份聚合的浏览量总和。

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

此步骤定义了级联关系。`FROM` 语句将使用 `monthly_aggregated_data` 表,这意味着数据流向如下:

1. 数据到达 `hourly_data` 表。
2. ClickHouse 将接收到的数据转发到第一个物化视图 `monthly_aggregated_data` 表,
3. 最后,步骤 2 中接收到的数据将被转发到 `year_aggregated_data`。

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
在使用物化视图时,一个常见的误解是认为数据是从表中读取的。但这并非物化视图的工作方式;转发的数据是插入的数据块,而不是表中的最终结果。

假设在此示例中,`monthly_aggregated_data` 使用的引擎是 CollapsingMergeTree,那么转发到第二个物化视图 `year_aggregated_data_mv` 的数据将不是折叠表的最终结果,而是转发包含 `SELECT ... GROUP BY` 中定义字段的数据块。

如果您使用 CollapsingMergeTree、ReplacingMergeTree 或 SummingMergeTree,并且计划创建级联物化视图,您需要理解此处描述的限制。
:::


## 示例数据 {#sample-data}

现在是时候通过插入一些数据来测试我们的级联物化视图了:

```sql
INSERT INTO analytics.hourly_data (domain_name, event_time, count_views)
VALUES ('clickhouse.com', '2019-01-01 10:00:00', 1),
       ('clickhouse.com', '2019-02-02 00:00:00', 2),
       ('clickhouse.com', '2019-02-01 00:00:00', 3),
       ('clickhouse.com', '2020-01-01 00:00:00', 6);
```

如果您查询 `analytics.hourly_data` 的内容,将看到以下结果。由于表引擎为 `Null`,虽然数据已被处理,但表中不会显示任何行。

```sql
SELECT * FROM analytics.hourly_data
```

```response
Ok.

0 rows in set. Elapsed: 0.002 sec.
```

我们使用了一个小数据集,以便能够跟踪并验证结果是否符合预期。一旦您的数据流在小数据集上运行正确,就可以处理大量数据了。


## 结果 {#results}

如果您尝试通过选择 `sumCountViews` 字段来查询目标表,您将看到二进制表示形式(在某些终端中),因为该值并非以数字形式存储,而是以 AggregateFunction 类型存储。
要获取聚合的最终结果,您需要使用 `-Merge` 后缀。

您可以通过以下查询查看 AggregateFunction 中存储的特殊字符:

```sql
SELECT sumCountViews FROM analytics.monthly_aggregated_data
```

```response
┌─sumCountViews─┐
│               │
│               │
│               │
└───────────────┘

返回 3 行。用时:0.003 秒。
```

下面我们尝试使用 `Merge` 后缀来获取 `sumCountViews` 值:

```sql
SELECT
   sumMerge(sumCountViews) AS sumCountViews
FROM analytics.monthly_aggregated_data;
```

```response
┌─sumCountViews─┐
│            12 │
└───────────────┘

返回 1 行。用时:0.003 秒。
```

在 `AggregatingMergeTree` 中,我们将 `AggregateFunction` 定义为 `sum`,因此可以使用 `sumMerge`。当我们对 `AggregateFunction` 使用 `avg` 函数时,则使用 `avgMerge`,以此类推。

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

现在我们可以验证物化视图是否达到了我们定义的目标。

现在数据已存储在目标表 `monthly_aggregated_data` 中,我们可以获取按月份聚合的各域名数据:

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

返回 3 行。用时:0.004 秒。
```

按年份聚合的各域名数据:

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

返回 2 行。用时:0.004 秒。
```


## 将多个源表合并到单个目标表 {#combining-multiple-source-tables-to-single-target-table}

物化视图还可用于将多个源表合并到同一个目标表中。这对于创建类似 `UNION ALL` 逻辑的物化视图非常有用。

首先,创建两个源表来表示不同的指标集:

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

然后创建包含合并指标集的 `Target` 表:

```sql
CREATE TABLE analytics.daily_overview
(
    `on_date` Date,
    `domain_name` String,
    `impressions` SimpleAggregateFunction(sum, UInt64),
    `clicks` SimpleAggregateFunction(sum, UInt64)
) ENGINE = AggregatingMergeTree ORDER BY (on_date, domain_name)
```

创建两个指向同一个 `Target` 表的物化视图。您不需要显式包含缺失的列:

```sql
CREATE MATERIALIZED VIEW analytics.daily_impressions_mv
TO analytics.daily_overview
AS
SELECT
    toDate(event_time) AS on_date,
    domain_name,
    count() AS impressions,
    0 clicks         ---<<<--- 如果省略此项,结果将是相同的 0
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
    0 impressions    ---<<<--- 如果省略此项,结果将是相同的 0
FROM
    analytics.clicks
GROUP BY
    toDate(event_time) AS on_date,
    domain_name
;
```

现在当您插入值时,这些值将被聚合到 `Target` 表中各自对应的列:

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

在 `Target` 表中查询合并的展示次数和点击次数:

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

此查询应输出类似以下内容:

```response
┌────on_date─┬─domain_name────┬─impressions─┬─clicks─┐
│ 2019-01-01 │ clickhouse.com │           2 │      2 │
│ 2019-03-01 │ clickhouse.com │           1 │      1 │
│ 2019-02-01 │ clickhouse.com │           1 │      0 │
└────────────┴────────────────┴─────────────┴────────┘

返回 3 行。耗时:0.018 秒。
```
