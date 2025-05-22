---
'slug': '/guides/developer/cascading-materialized-views'
'title': '级联物化视图'
'description': '如何使用多个物化视图从一个源表.'
'keywords':
- 'materialized view'
- 'aggregation'
---


# 级联物化视图

此示例演示如何创建一个物化视图，然后如何将第二个物化视图级联到第一个视图。在这一页中，您将看到如何做到这一点、许多可能性以及限制。通过使用第二个物化视图作为源，您可以回答不同的用例。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/QDAJTKZT8y4?si=1KqPNHHfaKfxtPat" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

<br />

示例：

我们将使用一个虚拟数据集，记录一组域名每小时的视图数量。

我们的目标

1. 我们需要按月对每个域名的数据进行聚合，
2. 我们还需要按年对每个域名的数据进行聚合。

您可以选择以下选项之一：

- 编写查询，在 SELECT 请求期间读取和聚合数据
- 在摄取时将数据准备为新的格式
- 在摄取时将数据准备为特定的聚合格式。

使用物化视图准备数据将使您能够限制 ClickHouse 需要处理的数据量和计算，从而加快 SELECT 请求的速度。

## 物化视图的源表 {#source-table-for-the-materialized-views}

创建源表，因为我们的目标涉及对聚合数据进行报告，而不是对单个行进行报告，我们可以解析它，将信息传递给物化视图，并丢弃实际的输入数据。这满足了我们的目标并节省了存储，因此我们将使用 `Null` 表引擎。

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
您可以在 Null 表上创建物化视图。因此，写入该表的数据将影响视图，但原始原始数据仍将被丢弃。
:::

## 按月聚合的表和物化视图 {#monthly-aggregated-table-and-materialized-view}

对于第一个物化视图，我们需要创建 `Target` 表，在本示例中，它将是 `analytics.monthly_aggregated_data`，我们将按月和域名存储视图的总和。

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

## 按年聚合的表和物化视图 {#yearly-aggregated-table-and-materialized-view}

现在我们将创建第二个物化视图，它将链接到我们之前的目标表 `monthly_aggregated_data`。

首先，我们将创建一个新目标表，该表将存储按年聚合的每个域名的视图总和。

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

此步骤定义了级联。`FROM` 语句将使用 `monthly_aggregated_data` 表，这意味着数据流将是：

1. 数据发送到 `hourly_data` 表。
2. ClickHouse 将把接收到的数据转发到第一个物化视图 `monthly_aggregated_data` 表，
3. 最后，步骤 2 中接收到的数据将被转发到 `year_aggregated_data`。

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
在使用物化视图时，一个常见的误解是数据是从表中读取的。实际上，`物化视图` 的工作方式并非如此；转发的数据是插入的块，而不是表中的最终结果。

假设在本示例中，`monthly_aggregated_data` 使用的引擎是 CollapsingMergeTree，被转发到我们第二个物化视图 `year_aggregated_data_mv` 的数据将不是已合并表的最终结果，而是转发的包含字段的块，如在 `SELECT ... GROUP BY` 中定义的那样。

如果您使用 CollapsingMergeTree、ReplacingMergeTree，甚至 SummingMergeTree，并打算创建级联物化视图，则需要理解此处描述的限制。
:::

## 示例数据 {#sample-data}

现在是通过插入一些数据来测试我们的级联物化视图的时刻：

```sql
INSERT INTO analytics.hourly_data (domain_name, event_time, count_views)
VALUES ('clickhouse.com', '2019-01-01 10:00:00', 1),
       ('clickhouse.com', '2019-02-02 00:00:00', 2),
       ('clickhouse.com', '2019-02-01 00:00:00', 3),
       ('clickhouse.com', '2020-01-01 00:00:00', 6);
```

如果您选择 `analytics.hourly_data` 的内容，您将看到如下所示，因为表引擎是 `Null`，但数据已经被处理。

```sql
SELECT * FROM analytics.hourly_data
```

```response
Ok.

0 rows in set. Elapsed: 0.002 sec.
```

我们使用了一个小型数据集，以确保我们能够跟踪并比较结果与我们的预期。一旦您的流量在小型数据集上是正确的，您可以直接移动到大量数据。

## 结果 {#results}

如果您尝试通过选择 `sumCountViews` 字段来查询目标表，您将看到二进制表示（在某些终端中），因为该值未作为数字存储，而是作为 AggregateFunction 类型存储。
要获取聚合的最终结果，您应该使用 `-Merge` 后缀。

您可以使用此查询查看存储在 AggregateFunction 中的特殊字符：

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

在 `AggregatingMergeTree` 中，我们已将 `AggregateFunction` 定义为 `sum`，因此可以使用 `sumMerge`。当我们在 `AggregateFunction` 上使用函数 `avg` 时，我们将使用 `avgMerge`，以此类推。

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

现在我们可以检查物化视图是否满足我们定义的目标。

现在我们在目标表 `monthly_aggregated_data` 中存储了数据，我们可以获取每个域名按月聚合的数据：

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


## 将多个源表合并到单个目标表 {#combining-multiple-source-tables-to-single-target-table}

物化视图也可以用于将多个源表合并到同一目标表中。这对于创建类似于 `UNION ALL` 逻辑的物化视图非常有用。

首先，创建两个源表，表示不同的指标集合：

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

然后创建带有组合指标集的 `Target` 表：

```sql
CREATE TABLE analytics.daily_overview
(
    `on_date` Date,
    `domain_name` String,
    `impressions` SimpleAggregateFunction(sum, UInt64),
    `clicks` SimpleAggregateFunction(sum, UInt64)
) ENGINE = AggregatingMergeTree ORDER BY (on_date, domain_name)
```

创建两个指向相同 `Target` 表的物化视图。您不需要明确包含缺失的列：

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

现在，当您插入值时，这些值将被聚合到 `Target` 表的各自列中：

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

在 `Target` 表中合并的展示次数和点击次数：

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

此查询应输出类似如下内容：

```response
┌────on_date─┬─domain_name────┬─impressions─┬─clicks─┐
│ 2019-01-01 │ clickhouse.com │           2 │      2 │
│ 2019-03-01 │ clickhouse.com │           1 │      1 │
│ 2019-02-01 │ clickhouse.com │           1 │      0 │
└────────────┴────────────────┴─────────────┴────────┘

3 rows in set. Elapsed: 0.018 sec.
```
