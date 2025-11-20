---
title: '分析函数 - 时间序列'
sidebar_label: '分析函数'
description: '用于在 ClickHouse 中分析时间序列数据的函数。'
slug: /use-cases/time-series/analysis-functions
keywords: ['time-series', 'analysis functions', 'window functions', 'aggregation functions', 'moving averages', 'trend analysis']
show_related_blogs: true
doc_type: 'reference'
---



# 时间序列分析函数

在 ClickHouse 中，可以使用标准的 SQL 聚合函数和窗口函数来进行时间序列分析。  
处理时间序列数据时，通常会遇到三类主要指标：

* 随时间单调递增的 Counter 指标（例如页面浏览量或事件总数）
* 表示某一时刻测量值、且可上下波动的 Gauge 指标（例如 CPU 使用率或温度）
* 对观测值进行采样并按桶计数的直方图（例如请求时长或响应大小）

这些指标常见的分析模式包括对不同时期之间的数值进行比较、计算累积总量、计算变化速率以及分析分布。  
这些都可以通过聚合、`sum() OVER` 等窗口函数以及 `histogram()` 等专用函数的组合来实现。



## 环比变化 {#time-series-period-over-period-changes}

在分析时间序列数据时,我们经常需要了解数值在不同时间段之间的变化情况。
这对于仪表类指标和计数器类指标都至关重要。
[`lagInFrame`](/docs/sql-reference/window-functions/lagInFrame) 窗口函数可以让我们访问上一时间段的值来计算这些变化。

以下查询通过计算 "Weird Al" Yankovic 维基百科页面的日环比浏览量变化来演示此功能。
trend 列显示与前一天相比流量是增加(正值)还是减少(负值),有助于识别活动中的异常峰值或骤降。

```sql
SELECT
    toDate(time) AS day,
    sum(hits) AS h,
    lagInFrame(h) OVER (ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS p,
    h - p AS trend
FROM wikistat
WHERE path = '"Weird_Al"_Yankovic'
GROUP BY ALL
LIMIT 10;
```

```text
┌────────day─┬────h─┬────p─┬─trend─┐
│ 2015-05-01 │ 3934 │    0 │  3934 │
│ 2015-05-02 │ 3411 │ 3934 │  -523 │
│ 2015-05-03 │ 3195 │ 3411 │  -216 │
│ 2015-05-04 │ 3076 │ 3195 │  -119 │
│ 2015-05-05 │ 3450 │ 3076 │   374 │
│ 2015-05-06 │ 3053 │ 3450 │  -397 │
│ 2015-05-07 │ 2890 │ 3053 │  -163 │
│ 2015-05-08 │ 3898 │ 2890 │  1008 │
│ 2015-05-09 │ 3092 │ 3898 │  -806 │
│ 2015-05-10 │ 3508 │ 3092 │   416 │
└────────────┴──────┴──────┴───────┘
```


## 累积值 {#time-series-cumulative-values}

计数器指标会随时间自然累积。
为了分析这种累积增长,我们可以使用窗口函数计算运行总计。

以下查询通过使用 `sum() OVER` 子句来演示这一点,该子句创建运行总计。`bar()` 函数提供增长的可视化表示。

```sql
SELECT
    toDate(time) AS day,
    sum(hits) AS h,
    sum(h) OVER (ROWS BETWEEN UNBOUNDED PRECEDING AND 0 FOLLOWING) AS c,
    bar(c, 0, 50000, 25) AS b
FROM wikistat
WHERE path = '"Weird_Al"_Yankovic'
GROUP BY ALL
ORDER BY day
LIMIT 10;
```

```text
┌────────day─┬────h─┬─────c─┬─b─────────────────┐
│ 2015-05-01 │ 3934 │  3934 │ █▉                │
│ 2015-05-02 │ 3411 │  7345 │ ███▋              │
│ 2015-05-03 │ 3195 │ 10540 │ █████▎            │
│ 2015-05-04 │ 3076 │ 13616 │ ██████▊           │
│ 2015-05-05 │ 3450 │ 17066 │ ████████▌         │
│ 2015-05-06 │ 3053 │ 20119 │ ██████████        │
│ 2015-05-07 │ 2890 │ 23009 │ ███████████▌      │
│ 2015-05-08 │ 3898 │ 26907 │ █████████████▍    │
│ 2015-05-09 │ 3092 │ 29999 │ ██████████████▉   │
│ 2015-05-10 │ 3508 │ 33507 │ ████████████████▊ │
└────────────┴──────┴───────┴───────────────────┘
```


## 速率计算 {#time-series-rate-calculations}

在分析时间序列数据时,了解单位时间内的事件发生速率往往很有用。
此查询通过将每小时总数除以一小时的秒数(3600)来计算每秒的页面浏览速率。
可视化条形图有助于识别活动的高峰时段。

```sql
SELECT
    toStartOfHour(time) AS time,
    sum(hits) AS hits,
    round(hits / (60 * 60), 2) AS rate,
    bar(rate * 10, 0, max(rate * 10) OVER (), 25) AS b
FROM wikistat
WHERE path = '"Weird_Al"_Yankovic'
GROUP BY time
LIMIT 10;
```

```text
┌────────────────time─┬───h─┬─rate─┬─b─────┐
│ 2015-07-01 01:00:00 │ 143 │ 0.04 │ █▊    │
│ 2015-07-01 02:00:00 │ 170 │ 0.05 │ ██▏   │
│ 2015-07-01 03:00:00 │ 148 │ 0.04 │ █▊    │
│ 2015-07-01 04:00:00 │ 190 │ 0.05 │ ██▏   │
│ 2015-07-01 05:00:00 │ 253 │ 0.07 │ ███▏  │
│ 2015-07-01 06:00:00 │ 233 │ 0.06 │ ██▋   │
│ 2015-07-01 07:00:00 │ 359 │  0.1 │ ████▍ │
│ 2015-07-01 08:00:00 │ 190 │ 0.05 │ ██▏   │
│ 2015-07-01 09:00:00 │ 121 │ 0.03 │ █▎    │
│ 2015-07-01 10:00:00 │  70 │ 0.02 │ ▉     │
└─────────────────────┴─────┴──────┴───────┘
```


## 直方图 {#time-series-histograms}

时间序列数据的一个常见应用场景是基于跟踪的事件构建直方图。
假设我们想要了解页面按总点击量的分布情况,仅包含点击量超过 10,000 的页面。
我们可以使用 `histogram()` 函数根据分箱数量自动生成自适应直方图:

```sql
SELECT
    histogram(10)(hits) AS hist
FROM
(
    SELECT
        path,
        sum(hits) AS hits
    FROM wikistat
    WHERE date(time) = '2015-06-15'
    GROUP BY path
    HAVING hits > 10000
)
FORMAT Vertical;
```

```text
Row 1:
──────
hist: [(10033,23224.55065359477,60.625),(23224.55065359477,37855.38888888889,15.625),(37855.38888888889,52913.5,3.5),(52913.5,69438,1.25),(69438,83102.16666666666,1.25),(83102.16666666666,94267.66666666666,2.5),(94267.66666666666,116778,1.25),(116778,186175.75,1.125),(186175.75,946963.25,1.75),(946963.25,1655250,1.125)]
```

然后我们可以使用 [`arrayJoin()`](/docs/sql-reference/functions/array-join) 来处理数据,并使用 `bar()` 进行可视化:

```sql
WITH histogram(10)(hits) AS hist
SELECT
    round(arrayJoin(hist).1) AS lowerBound,
    round(arrayJoin(hist).2) AS upperBound,
    arrayJoin(hist).3 AS count,
    bar(count, 0, max(count) OVER (), 20) AS b
FROM
(
    SELECT
        path,
        sum(hits) AS hits
    FROM wikistat
    WHERE date(time) = '2015-06-15'
    GROUP BY path
    HAVING hits > 10000
);
```

```text
┌─lowerBound─┬─upperBound─┬──count─┬─b────────────────────┐
│      10033 │      19886 │ 53.375 │ ████████████████████ │
│      19886 │      31515 │ 18.625 │ ██████▉              │
│      31515 │      43518 │  6.375 │ ██▍                  │
│      43518 │      55647 │  1.625 │ ▌                    │
│      55647 │      73602 │  1.375 │ ▌                    │
│      73602 │      92880 │   3.25 │ █▏                   │
│      92880 │     116778 │  1.375 │ ▌                    │
│     116778 │     186176 │  1.125 │ ▍                    │
│     186176 │     946963 │   1.75 │ ▋                    │
│     946963 │    1655250 │  1.125 │ ▍                    │
└────────────┴────────────┴────────┴──────────────────────┘
```
