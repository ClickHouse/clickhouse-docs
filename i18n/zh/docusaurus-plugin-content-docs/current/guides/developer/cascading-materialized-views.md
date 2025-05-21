---
'slug': '/guides/developer/cascading-materialized-views'
'title': '物化视图级联'
'description': '如何从源表中使用多个物化视图。'
'keywords':
- 'materialized view'
- 'aggregation'
---




# 级联物化视图

本示例演示了如何创建物化视图，然后如何将第二个物化视图级联到第一个。在此页面中，您将看到如何实现它，许多可能性以及限制。通过使用第二个物化视图作为源创建物化视图，可以满足不同用例的需求。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/QDAJTKZT8y4?si=1KqPNHHfaKfxtPat" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

<br />

示例：

我们将使用一个虚假的数据集，该数据集记录了一组域名每小时的浏览量。

我们的目标

1. 我们需要按月聚合每个域名的数据，
2. 我们还需要按年聚合每个域名的数据。

您可以选择以下选项之一：

- 编写查询，在 SELECT 请求期间读取和聚合数据
- 在摄取时将数据准备为新格式
- 在摄取时为特定聚合准备数据。

使用物化视图准备数据将允许您限制 ClickHouse 需要处理的数据和计算量，从而使您的 SELECT 请求更快。

## 物化视图的源表 {#source-table-for-the-materialized-views}

创建源表，因为我们的目标涉及对聚合数据进行报告，而不是个别行，我们可以解析它，将信息传递给物化视图，并丢弃实际的传入数据。这符合我们的目标，并节省存储，因此我们将使用 `Null` 表引擎。

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
您可以在 Null 表上创建物化视图。因此，写入该表的数据将影响视图，但原始的原始数据仍将被丢弃。
:::

## 按月聚合的表和物化视图 {#monthly-aggregated-table-and-materialized-view}

对于第一个物化视图，我们需要创建 `Target` 表，对于此示例，将为 `analytics.monthly_aggregated_data`，我们将按月和域名存储浏览量的总和。

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

将数据转发到目标表的物化视图看起来如下：

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

现在我们将创建第二个物化视图，该视图将链接到我们之前的目标表 `monthly_aggregated_data`。

首先，我们将创建一个新目标表，该表将存储每个域名按年聚合的浏览量总和。

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

1. 数据到达 `hourly_data` 表。
2. ClickHouse 将转发接收到的数据到第一个物化视图 `monthly_aggregated_data` 表，
3. 最后，在步骤 2 中接收的数据将被转发到 `year_aggregated_data`。

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
在处理物化视图时，一个常见的误解是数据是从表中读取的。这不是 `物化视图` 的工作原理；转发的数据是插入的块，而不是您表中的最终结果。

假设在这个例子中，`monthly_aggregated_data` 使用的引擎是 CollapsingMergeTree，转发到我们的第二个物化视图 `year_aggregated_data_mv` 的数据将不是冲突表的最终结果，而是包含按 `SELECT ... GROUP BY` 定义的字段的数据块。

如果您使用 CollapsingMergeTree、ReplacingMergeTree，甚至 SummingMergeTree，并且计划创建级联物化视图，则需要理解此处描述的限制。
:::

## 示例数据 {#sample-data}

现在是插入一些数据测试我们的级联物化视图的时候了：

```sql
INSERT INTO analytics.hourly_data (domain_name, event_time, count_views)
VALUES ('clickhouse.com', '2019-01-01 10:00:00', 1),
       ('clickhouse.com', '2019-02-02 00:00:00', 2),
       ('clickhouse.com', '2019-02-01 00:00:00', 3),
       ('clickhouse.com', '2020-01-01 00:00:00', 6);
```

如果您 SELECT `analytics.hourly_data` 的内容，您将看到如下内容，因为表引擎是 `Null`，但数据已被处理。

```sql
SELECT * FROM analytics.hourly_data
```

```response
Ok.

0 rows in set. Elapsed: 0.002 sec.
```

我们使用了一个小数据集，以确保我们可以跟踪并将结果与预期进行比较。一旦您的流程与小数据集正确，您可以直接转向处理大量数据。

## 结果 {#results}

如果您尝试通过选择 `sumCountViews` 字段来查询目标表，您将看到二进制表示（在某些终端中），因为该值并不是以数字形式存储，而是以 AggregateFunction 类型存储。
要获取聚合的最终结果，您应使用 `-Merge` 后缀。

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

相反，让我们尝试使用 `Merge` 后缀来获取 `sumCountViews` 的值：

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

在 `AggregatingMergeTree` 中，我们将 `AggregateFunction` 定义为 `sum`，因此我们可以使用 `sumMerge`。当我们对 `AggregateFunction` 使用函数 `avg` 时，我们将使用 `avgMerge`，等等。

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

现在我们可以查看物化视图是否满足我们定义的目标。

现在我们已经在目标表 `monthly_aggregated_data` 中存储了数据，我们可以获取每个域名按月聚合的数据：

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

每个域名按年聚合的数据：

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

## 将多个源表合并为单个目标表 {#combining-multiple-source-tables-to-single-target-table}

物化视图还可以用于将多个源表合并到同一个目标表。这对创建一个类似于 `UNION ALL` 逻辑的物化视图非常有用。

首先，创建两个源表，分别表示不同的一组指标：

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

然后创建带有合并后的指标集的 `Target` 表：

```sql
CREATE TABLE analytics.daily_overview
(
    `on_date` Date,
    `domain_name` String,
    `impressions` SimpleAggregateFunction(sum, UInt64),
    `clicks` SimpleAggregateFunction(sum, UInt64)
) ENGINE = AggregatingMergeTree ORDER BY (on_date, domain_name)
```

创建两个物化视图，指向同一个 `Target` 表。您不需要显式地包含缺失的列：

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

现在，当您插入值时，这些值将被聚合到 `Target` 表中的各自列：

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

`Target` 表中合并的展示量和点击量：

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

此查询应输出类似以下内容：

```response
┌────on_date─┬─domain_name────┬─impressions─┬─clicks─┐
│ 2019-01-01 │ clickhouse.com │           2 │      2 │
│ 2019-03-01 │ clickhouse.com │           1 │      1 │
│ 2019-02-01 │ clickhouse.com │           1 │      0 │
└────────────┴────────────────┴─────────────┴────────┘

3 rows in set. Elapsed: 0.018 sec.
```
