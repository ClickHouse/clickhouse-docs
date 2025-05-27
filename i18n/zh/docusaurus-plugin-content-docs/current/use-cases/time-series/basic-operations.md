---
'title': '基本操作 - 时间序列'
'sidebar_label': '基本操作'
'description': '在 ClickHouse 中的基本时间序列操作。'
'slug': '/use-cases/time-series/basic-operations'
'keywords':
- 'time-series'
---


# 基本时间序列操作

ClickHouse 提供了多种方法来处理时间序列数据，使您能够在不同时间段内聚合、分组和分析数据点。 
本节涵盖了在处理基于时间的数据时常用的基本操作。

常见的操作包括按时间间隔对数据进行分组、处理时间序列数据中的间隙，以及计算时间段间的变化。 
这些操作可以使用标准 SQL 语法结合 ClickHouse 的内置时间函数来执行。

我们将使用 Wikistat（Wikipedia 页面浏览数据）数据集来探索 ClickHouse 的时间序列查询能力：

```sql
CREATE TABLE wikistat
(
    `time` DateTime,
    `project` String,
    `subproject` String,
    `path` String,
    `hits` UInt64
)
ENGINE = MergeTree
ORDER BY (time);
```

让我们用 10 亿条记录填充这个表：

```sql
INSERT INTO wikistat 
SELECT *
FROM s3('https://ClickHouse-public-datasets.s3.amazonaws.com/wikistat/partitioned/wikistat*.native.zst') 
LIMIT 1e9;
```

## 按时间桶聚合 {#time-series-aggregating-time-bucket}

最常见的需求是基于时间段聚合数据，例如获取每天的总点击量：

```sql
SELECT
    toDate(time) AS date,
    sum(hits) AS hits
FROM wikistat
GROUP BY ALL
ORDER BY date ASC
LIMIT 5;
```

```text
┌───────date─┬─────hits─┐
│ 2015-05-01 │ 25524369 │
│ 2015-05-02 │ 25608105 │
│ 2015-05-03 │ 28567101 │
│ 2015-05-04 │ 29229944 │
│ 2015-05-05 │ 29383573 │
└────────────┴──────────┘
```

我们在这里使用了 [`toDate()`](/sql-reference/functions/type-conversion-functions#todate) 函数，它将指定的时间转换为日期类型。或者，我们可以按小时分组并筛选特定日期：

```sql
SELECT
    toStartOfHour(time) AS hour,
    sum(hits) AS hits    
FROM wikistat
WHERE date(time) = '2015-07-01'
GROUP BY ALL
ORDER BY hour ASC
LIMIT 5;
```

```text
┌────────────────hour─┬───hits─┐
│ 2015-07-01 00:00:00 │ 656676 │
│ 2015-07-01 01:00:00 │ 768837 │
│ 2015-07-01 02:00:00 │ 862311 │
│ 2015-07-01 03:00:00 │ 829261 │
│ 2015-07-01 04:00:00 │ 749365 │
└─────────────────────┴────────┘
```

这里使用的 [`toStartOfHour()`](/docs/sql-reference/functions/date-time-functions#tostartofhour) 函数将给定的时间转换为小时的开始。 
您还可以按年份、季度、月份或天进行分组。

## 自定义分组间隔 {#time-series-custom-grouping-intervals}

我们甚至可以按任意时间间隔分组，例如，使用 [`toStartOfInterval()`](/docs/sql-reference/functions/date-time-functions#tostartofinterval) 函数分组为 5 分钟。 

假设我们想按 4 小时的间隔分组。我们可以使用 [`INTERVAL`](/docs/sql-reference/data-types/special-data-types/interval) 子句来指定分组间隔：

```sql
SELECT
    toStartOfInterval(time, INTERVAL 4 HOUR) AS interval,
    sum(hits) AS hits
FROM wikistat
WHERE date(time) = '2015-07-01'
GROUP BY ALL
ORDER BY interval ASC
LIMIT 6;
```

或者，我们可以使用 [`toIntervalHour()`](/docs/sql-reference/functions/type-conversion-functions#tointervalhour) 函数

```sql
SELECT
    toStartOfInterval(time, toIntervalHour(4)) AS interval,
    sum(hits) AS hits
FROM wikistat
WHERE date(time) = '2015-07-01'
GROUP BY ALL
ORDER BY interval ASC
LIMIT 6;
```

无论哪种方式，我们都可以得到以下结果：

```text
┌────────────interval─┬────hits─┐
│ 2015-07-01 00:00:00 │ 3117085 │
│ 2015-07-01 04:00:00 │ 2928396 │
│ 2015-07-01 08:00:00 │ 2679775 │
│ 2015-07-01 12:00:00 │ 2461324 │
│ 2015-07-01 16:00:00 │ 2823199 │
│ 2015-07-01 20:00:00 │ 2984758 │
└─────────────────────┴─────────┘
```

## 填充空组 {#time-series-filling-empty-groups}

在许多情况下，我们处理稀疏数据，某些时间段缺失。这会导致出现空桶。让我们来看一个示例，其中我们按 1 小时的间隔分组数据。这将输出以下统计数据，其中某些小时缺失值：

```sql
SELECT
    toStartOfHour(time) AS hour,
    sum(hits)
FROM wikistat
WHERE (project = 'ast') AND (subproject = 'm') AND (date(time) = '2015-07-01')
GROUP BY ALL
ORDER BY hour ASC;
```

```text
┌────────────────hour─┬─sum(hits)─┐
│ 2015-07-01 00:00:00 │         3 │ <- missing values
│ 2015-07-01 02:00:00 │         1 │ <- missing values
│ 2015-07-01 04:00:00 │         1 │
│ 2015-07-01 05:00:00 │         2 │
│ 2015-07-01 06:00:00 │         1 │
│ 2015-07-01 07:00:00 │         1 │
│ 2015-07-01 08:00:00 │         3 │
│ 2015-07-01 09:00:00 │         2 │ <- missing values
│ 2015-07-01 12:00:00 │         2 │
│ 2015-07-01 13:00:00 │         4 │
│ 2015-07-01 14:00:00 │         2 │
│ 2015-07-01 15:00:00 │         2 │
│ 2015-07-01 16:00:00 │         2 │
│ 2015-07-01 17:00:00 │         1 │
│ 2015-07-01 18:00:00 │         5 │
│ 2015-07-01 19:00:00 │         5 │
│ 2015-07-01 20:00:00 │         4 │
│ 2015-07-01 21:00:00 │         4 │
│ 2015-07-01 22:00:00 │         2 │
│ 2015-07-01 23:00:00 │         2 │
└─────────────────────┴───────────┘
```

ClickHouse 提供了 [`WITH FILL`](/docs/guides/developer/time-series-filling-gaps#with-fill) 修饰符来解决此问题。这样可以将所有空缺的小时填充为零，从而更好地理解随时间的分布：

```sql
SELECT
    toStartOfHour(time) AS hour,
    sum(hits)
FROM wikistat
WHERE (project = 'ast') AND (subproject = 'm') AND (date(time) = '2015-07-01')
GROUP BY ALL
ORDER BY hour ASC WITH FILL STEP toIntervalHour(1);
```

```text
┌────────────────hour─┬─sum(hits)─┐
│ 2015-07-01 00:00:00 │         3 │
│ 2015-07-01 01:00:00 │         0 │ <- new value
│ 2015-07-01 02:00:00 │         1 │
│ 2015-07-01 03:00:00 │         0 │ <- new value
│ 2015-07-01 04:00:00 │         1 │
│ 2015-07-01 05:00:00 │         2 │
│ 2015-07-01 06:00:00 │         1 │
│ 2015-07-01 07:00:00 │         1 │
│ 2015-07-01 08:00:00 │         3 │
│ 2015-07-01 09:00:00 │         2 │
│ 2015-07-01 10:00:00 │         0 │ <- new value
│ 2015-07-01 11:00:00 │         0 │ <- new value
│ 2015-07-01 12:00:00 │         2 │
│ 2015-07-01 13:00:00 │         4 │
│ 2015-07-01 14:00:00 │         2 │
│ 2015-07-01 15:00:00 │         2 │
│ 2015-07-01 16:00:00 │         2 │
│ 2015-07-01 17:00:00 │         1 │
│ 2015-07-01 18:00:00 │         5 │
│ 2015-07-01 19:00:00 │         5 │
│ 2015-07-01 20:00:00 │         4 │
│ 2015-07-01 21:00:00 │         4 │
│ 2015-07-01 22:00:00 │         2 │
│ 2015-07-01 23:00:00 │         2 │
└─────────────────────┴───────────┘
```

## 滚动时间窗口 {#time-series-rolling-time-windows}

有时，我们不想处理间隔的开始（例如，天或小时的开始），而是窗口间隔。 
假设我们想了解一个窗口的总点击量，而不是基于天，而是基于从下午 6 点开始的 24 小时周期。

我们可以使用 [`date_diff()`](/docs/sql-reference/functions/date-time-functions#date_diff) 函数来计算参考时间与每条记录时间之间的差值。 
在这种情况下，`day` 列将表示天数差（例如，1 天前、2 天前等）：

```sql
SELECT    
    dateDiff('day', toDateTime('2015-05-01 18:00:00'), time) AS day,
    sum(hits),
FROM wikistat
GROUP BY ALL
ORDER BY day ASC
LIMIT 5;
```

```text
┌─day─┬─sum(hits)─┐
│   0 │  25524369 │
│   1 │  25608105 │
│   2 │  28567101 │
│   3 │  29229944 │
│   4 │  29383573 │
└─────┴───────────┘
```
