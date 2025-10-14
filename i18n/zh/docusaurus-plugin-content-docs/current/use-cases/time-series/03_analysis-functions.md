---
'title': '分析函数 - 时间序列'
'sidebar_label': '分析函数'
'description': '用于分析 ClickHouse 中时间序列数据的函数。'
'slug': '/use-cases/time-series/analysis-functions'
'keywords':
- 'time-series'
'show_related_blogs': true
'doc_type': 'reference'
---


# 时间序列分析函数

在 ClickHouse 中，时间序列分析可以使用标准 SQL 聚合和窗口函数来执行。 
在处理时间序列数据时，您通常会遇到三种主要类型的指标：

* 随时间单调增加的计数器指标（如页面浏览量或总事件数）
* 表示瞬时测量且可上下波动的计量指标（如 CPU 使用率或温度）
* 采样观测值并将其计数到桶中的直方图（如请求时长或响应大小）

这些指标的常见分析模式包括比较周期之间的值、计算累积总数、确定变化率和分析分布。 
这些都可以通过聚合、窗口函数如 `sum() OVER` 的组合以及像 `histogram()` 这样的专用函数来实现。

## 周期间变化 {#time-series-period-over-period-changes}

在分析时间序列数据时，我们通常需要了解值在时间段之间是如何变化的。 
这对计量和计数器指标都是必不可少的。 
[`lagInFrame`](/docs/sql-reference/window-functions/lagInFrame) 窗口函数使我们能够访问前一个时间段的值，以计算这些变化。

以下查询通过计算 “Weird Al” Yankovic 的维基百科页面的日变化量来演示这一点。
趋势列显示与前一天相比，流量是增加（正值）还是减少（负值），帮助识别活动中的异常激增或下降。

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

计数器指标自然随时间累积。 
要分析这种累积增长，我们可以使用窗口函数计算运行总数。

以下查询通过使用 `sum() OVER` 子句来创建运行总数，而 `bar()` 函数提供了增长的可视化表示。

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

在分析时间序列数据时，了解单位时间内事件的发生率往往很有用。 
此查询通过将每小时总数除以每小时的秒数（3600）来计算每秒的页面浏览量。 
可视化条形图帮助识别活动的高峰时段。

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

时间序列数据的一个流行用例是根据跟踪事件构建直方图。 
假设我们想了解基于总点击量的多个页面的分布情况，仅包括点击量超过 10,000 的页面。
我们可以使用 `histogram()` 函数根据桶的数量自动生成自适应直方图：

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

然后，我们可以使用 [`arrayJoin()`](/docs/sql-reference/functions/array-join) 来处理数据，并用 `bar()` 进行可视化：

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
