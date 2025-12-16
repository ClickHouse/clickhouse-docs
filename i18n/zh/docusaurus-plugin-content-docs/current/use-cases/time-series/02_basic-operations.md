---
title: '基本操作 - 时间序列'
sidebar_label: '基本操作'
description: 'ClickHouse 中时间序列的基本操作。'
slug: /use-cases/time-series/basic-operations
keywords: ['时间序列', '基本操作', '数据摄取', '查询', '过滤', '分组', '聚合']
show_related_blogs: true
doc_type: 'guide'
---

# 基本时间序列操作 {#basic-time-series-operations}

ClickHouse 提供了多种处理时间序列数据的方法，从而可以在不同时间区间内对数据点进行聚合、分组和分析。
本节介绍在处理时间型数据时常用的基本操作。

常见操作包括按时间间隔对数据进行分组、处理时间序列数据中的缺口，以及计算不同时间段之间的变化。
这些操作可以通过标准 SQL 语法结合 ClickHouse 的内置时间函数来完成。

我们将使用 Wikistat（Wikipedia 页面浏览量数据）数据集来探索 ClickHouse 的时间序列查询能力：

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

现在向该表中插入 10 亿条记录：

```sql
INSERT INTO wikistat 
SELECT *
FROM s3('https://ClickHouse-public-datasets.s3.amazonaws.com/wikistat/partitioned/wikistat*.native.zst') 
LIMIT 1e9;
```

## 按时间分桶聚合 {#time-series-aggregating-time-bucket}

最常见的需求是按时间周期对数据进行聚合，例如统计每天的总点击量：

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

我们在这里使用了 [`toDate()`](/sql-reference/functions/type-conversion-functions#toDate) 函数，它会将指定的时间转换为 `date` 类型。或者，我们也可以按小时分桶，然后按特定日期进行过滤：

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

这里使用的 [`toStartOfHour()`](/docs/sql-reference/functions/date-time-functions#toStartOfHour) 函数会将给定时间转换为所在小时的起始（整点）时间。
还可以按年份、季度、月份或日期进行分组。

## 自定义分组时间间隔 {#time-series-custom-grouping-intervals}

我们还可以按自定义时间间隔进行分组，例如使用 [`toStartOfInterval()`](/docs/sql-reference/functions/date-time-functions#toStartOfInterval) 函数按 5 分钟间隔分组。

假设我们想按 4 小时间隔分组。
我们可以使用 [`INTERVAL`](/docs/sql-reference/data-types/special-data-types/interval) 子句来指定分组间隔：

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

或者，我们也可以使用 [`toIntervalHour()`](/docs/sql-reference/functions/type-conversion-functions#toIntervalHour) 函数

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

无论哪种方式，结果如下：

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

在很多情况下，我们处理的是存在缺失区间的稀疏数据，这会产生空桶。下面来看一个示例：我们按 1 小时间隔对数据进行分组，输出的统计结果中会有部分小时缺少数值：

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

ClickHouse 提供了 [`WITH FILL`](/docs/guides/developer/time-series-filling-gaps#with-fill) 修饰符来解决这一问题。它会用零填充所有缺失的小时区间，从而帮助我们更好地理解随时间变化的分布：

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

有时，我们不想按时间区间的起始点（比如某一天或某一小时的开始）来处理，而是希望按时间窗口来处理。
假设我们想了解某个窗口内的 hits 总数，这个窗口不是按自然日划分，而是从下午 6 点开始，按 24 小时时长来划分。

我们可以使用 [`date_diff()`](/docs/sql-reference/functions/date-time-functions#timeDiff) 函数来计算参考时间与每条记录时间之间的差值。
在这个例子中，`day` 列将表示相差的天数（例如：1 天前、2 天前等）：

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
