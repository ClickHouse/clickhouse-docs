---
title: '时间序列基础操作'
sidebar_label: '基本操作'
description: 'ClickHouse 中时间序列的基本操作。'
slug: /use-cases/time-series/basic-operations
keywords: ['time-series', 'basic operations', 'data ingestion', 'querying', 'filtering', 'grouping', 'aggregation']
show_related_blogs: true
doc_type: 'guide'
---



# 基本时间序列操作

ClickHouse 提供了多种用于处理时间序列数据的方法，以便在不同时间段内对数据点进行聚合、分组和分析。
本节介绍在处理基于时间的数据时常用的基础操作。

常见操作包括按时间间隔对数据进行分组、处理时间序列数据中的空缺，以及计算不同时期之间的变化。
这些操作可以通过标准 SQL 语法结合 ClickHouse 内置的时间函数来完成。

我们将使用 Wikistat（Wikipedia 页面访问量数据）数据集来探索 ClickHouse 的时间序列查询能力：

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

让我们向该表插入 10 亿条记录：

```sql
INSERT INTO wikistat 
SELECT *
FROM s3('https://ClickHouse-public-datasets.s3.amazonaws.com/wikistat/partitioned/wikistat*.native.zst') 
LIMIT 1e9;
```


## 按时间桶聚合 {#time-series-aggregating-time-bucket}

最常见的需求是基于时间段聚合数据,例如获取每天的总点击量:

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

这里使用了 [`toDate()`](/sql-reference/functions/type-conversion-functions#todate) 函数,它将指定的时间转换为日期类型。或者,我们也可以按小时分组并筛选特定日期:

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

这里使用的 [`toStartOfHour()`](/docs/sql-reference/functions/date-time-functions#toStartOfHour) 函数将给定时间转换为该小时的起始时间。
您还可以按年、季度、月或日进行分组。


## 自定义分组间隔 {#time-series-custom-grouping-intervals}

我们甚至可以按任意时间间隔进行分组,例如使用 [`toStartOfInterval()`](/docs/sql-reference/functions/date-time-functions#toStartOfInterval) 函数按 5 分钟间隔分组。

假设我们想按 4 小时间隔进行分组。
我们可以使用 [`INTERVAL`](/docs/sql-reference/data-types/special-data-types/interval) 子句来指定分组间隔:

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

或者我们可以使用 [`toIntervalHour()`](/docs/sql-reference/functions/type-conversion-functions#tointervalhour) 函数

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

无论使用哪种方式,我们都会得到以下结果:

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


## 填充空分组 {#time-series-filling-empty-groups}

在很多情况下,我们处理的稀疏数据会存在一些缺失的时间间隔,这会导致出现空的时间桶。以下示例按1小时间隔对数据进行分组,输出的统计信息中某些小时的值是缺失的:

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
│ 2015-07-01 00:00:00 │         3 │ <- 缺失值
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

ClickHouse 提供了 [`WITH FILL`](/docs/guides/developer/time-series-filling-gaps#with-fill) 修饰符来解决此问题。它会将所有空的小时用零填充,以便更好地理解数据随时间的分布情况:

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
│ 2015-07-01 01:00:00 │         0 │ <- 新值
│ 2015-07-01 02:00:00 │         1 │
│ 2015-07-01 03:00:00 │         0 │ <- 新值
│ 2015-07-01 04:00:00 │         1 │
│ 2015-07-01 05:00:00 │         2 │
│ 2015-07-01 06:00:00 │         1 │
│ 2015-07-01 07:00:00 │         1 │
│ 2015-07-01 08:00:00 │         3 │
│ 2015-07-01 09:00:00 │         2 │
│ 2015-07-01 10:00:00 │         0 │ <- 新值
│ 2015-07-01 11:00:00 │         0 │ <- 新值
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

有时,我们不希望按照固定的时间间隔起点(如每天或每小时的开始时刻)来处理数据,而是希望使用滚动的时间窗口。
假设我们想要了解某个窗口的总点击量,不是按自然日统计,而是按从下午6点开始的24小时周期统计。

我们可以使用 [`date_diff()`](/docs/sql-reference/functions/date-time-functions#timeDiff) 函数来计算参考时间与每条记录时间之间的差值。
在这种情况下,`day` 列将表示相差的天数(例如,1天前、2天前等):

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
