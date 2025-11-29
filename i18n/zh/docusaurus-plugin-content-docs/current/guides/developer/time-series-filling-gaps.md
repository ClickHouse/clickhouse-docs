---
slug: /guides/developer/time-series-filling-gaps
sidebar_label: '时间序列 - 缺失填充'
sidebar_position: 10
description: '填充时间序列数据中的缺失值。'
keywords: ['时间序列', '缺失填充']
title: '填充时间序列数据中的缺失值'
doc_type: 'guide'
---

# 填补时间序列数据中的缺口 {#filling-gaps-in-time-series-data}

在处理时间序列数据时，由于数据缺失或业务/采集不活跃，数据中可能会出现间断。
通常在查询数据时，我们不希望这些缺口存在。在这种情况下，`WITH FILL` 子句就派上用场了。
本指南将介绍如何使用 `WITH FILL` 来填补时间序列数据中的缺口。

## 配置 {#setup}

假设我们有如下表，用于存储由生成式 AI 图像服务生成的图像的元数据：

```sql
CREATE TABLE images
(
    `id` String,
    `timestamp` DateTime64(3),
    `height` Int64,
    `width` Int64,
    `size` Int64
)
ENGINE = MergeTree
ORDER BY (size, height, width);
```

现在我们来导入一些记录：

```sql
INSERT INTO images VALUES (1088619203512250448, '2023-03-24 00:24:03.684', 1536, 1536, 2207289);
INSERT INTO images VALUES (1088619204040736859, '2023-03-24 00:24:03.810', 1024, 1024, 1928974);
INSERT INTO images VALUES (1088619204749561989, '2023-03-24 00:24:03.979', 1024, 1024, 1275619);
INSERT INTO images VALUES (1088619206431477862, '2023-03-24 00:24:04.380', 2048, 2048, 5985703);
INSERT INTO images VALUES (1088619206905434213, '2023-03-24 00:24:04.493', 1024, 1024, 1558455);
INSERT INTO images VALUES (1088619208524431510, '2023-03-24 00:24:04.879', 1024, 1024, 1494869);
INSERT INTO images VALUES (1088619208425437515, '2023-03-24 00:24:05.160', 1024, 1024, 1538451);
```

## 按桶查询 {#querying-by-bucket}

我们将查看创建时间在 2023 年 3 月 24 日 `00:24:03` 到 `00:24:04` 之间的图像，因此先为这两个时间点创建一些参数：

```sql
SET param_start = '2023-03-24 00:24:03',
    param_end = '2023-03-24 00:24:04';
```

接下来，我们将编写一个查询语句，将数据按 100ms 的时间桶进行分组，并返回每个时间桶中新建图像的数量：

```sql
SELECT
    toStartOfInterval(timestamp, toIntervalMillisecond(100)) AS bucket,
    count() AS count
FROM MidJourney.images
WHERE (timestamp >= {start:String}) AND (timestamp <= {end:String})
GROUP BY ALL
ORDER BY bucket ASC
```

```response
┌──────────────────bucket─┬─count─┐
│ 2023-03-24 00:24:03.600 │     1 │
│ 2023-03-24 00:24:03.800 │     1 │
│ 2023-03-24 00:24:03.900 │     1 │
│ 2023-03-24 00:24:04.300 │     1 │
│ 2023-03-24 00:24:04.400 │     1 │
│ 2023-03-24 00:24:04.800 │     1 │
└─────────────────────────┴───────┘
```

结果集只包含那些生成了图像的桶，但在时间序列分析时，我们可能希望返回每个 100ms 的桶，即使其中没有任何记录。

## WITH FILL {#with-fill}

我们可以使用 `WITH FILL` 子句来填补这些空缺。
我们还将指定 `STEP`，即要填充的间隔步长。
对于 `DateTime` 类型，默认步长为 1 秒，但我们希望填补长度为 100ms 的空缺，因此将步长设置为 100ms 的时间间隔：

```sql
SELECT
    toStartOfInterval(timestamp, toIntervalMillisecond(100)) AS bucket,
    count() AS count
FROM MidJourney.images
WHERE (timestamp >= {start:String}) AND (timestamp <= {end:String})
GROUP BY ALL
ORDER BY bucket ASC
WITH FILL
STEP toIntervalMillisecond(100);
```

```response
┌──────────────────bucket─┬─count─┐
│ 2023-03-24 00:24:03.600 │     1 │
│ 2023-03-24 00:24:03.700 │     0 │
│ 2023-03-24 00:24:03.800 │     1 │
│ 2023-03-24 00:24:03.900 │     1 │
│ 2023-03-24 00:24:04.000 │     0 │
│ 2023-03-24 00:24:04.100 │     0 │
│ 2023-03-24 00:24:04.200 │     0 │
│ 2023-03-24 00:24:04.300 │     1 │
│ 2023-03-24 00:24:04.400 │     1 │
│ 2023-03-24 00:24:04.500 │     0 │
│ 2023-03-24 00:24:04.600 │     0 │
│ 2023-03-24 00:24:04.700 │     0 │
│ 2023-03-24 00:24:04.800 │     1 │
└─────────────────────────┴───────┘
```

可以看到，`count` 列中的空缺已经被填充为 0。

## WITH FILL...FROM {#with-fillfrom}

然而，在时间范围的起始位置仍然存在一个空缺，我们可以通过指定 `FROM` 来填补这一点：

```sql
SELECT
    toStartOfInterval(timestamp, toIntervalMillisecond(100)) AS bucket,
    count() AS count
FROM MidJourney.images
WHERE (timestamp >= {start:String}) AND (timestamp <= {end:String})
GROUP BY ALL
ORDER BY bucket ASC
WITH FILL
FROM toDateTime64({start:String}, 3)
STEP toIntervalMillisecond(100);
```

```response
┌──────────────────bucket─┬─count─┐
│ 2023-03-24 00:24:03.000 │     0 │
│ 2023-03-24 00:24:03.100 │     0 │
│ 2023-03-24 00:24:03.200 │     0 │
│ 2023-03-24 00:24:03.300 │     0 │
│ 2023-03-24 00:24:03.400 │     0 │
│ 2023-03-24 00:24:03.500 │     0 │
│ 2023-03-24 00:24:03.600 │     1 │
│ 2023-03-24 00:24:03.700 │     0 │
│ 2023-03-24 00:24:03.800 │     1 │
│ 2023-03-24 00:24:03.900 │     1 │
│ 2023-03-24 00:24:04.000 │     0 │
│ 2023-03-24 00:24:04.100 │     0 │
│ 2023-03-24 00:24:04.200 │     0 │
│ 2023-03-24 00:24:04.300 │     1 │
│ 2023-03-24 00:24:04.400 │     1 │
│ 2023-03-24 00:24:04.500 │     0 │
│ 2023-03-24 00:24:04.600 │     0 │
│ 2023-03-24 00:24:04.700 │     0 │
│ 2023-03-24 00:24:04.800 │     1 │
└─────────────────────────┴───────┘
```

从结果可以看到，`00:24:03.000` 到 `00:24:03.500` 这一段的所有分桶现在都已经显示出来了。

## WITH FILL...TO {#with-fillto}

不过，在时间范围的末尾我们仍然缺少一些桶，可以通过提供一个 `TO` 值来填补。
`TO` 不包含其自身指定的时间点，因此我们会在结束时间上增加一小段时间，以确保该时间点被包含在内：

```sql
SELECT
    toStartOfInterval(timestamp, toIntervalMillisecond(100)) AS bucket,
    count() AS count
FROM MidJourney.images
WHERE (timestamp >= {start:String}) AND (timestamp <= {end:String})
GROUP BY ALL
ORDER BY bucket ASC
WITH FILL
FROM toDateTime64({start:String}, 3)
TO toDateTime64({end:String}, 3) + INTERVAL 1 millisecond
STEP toIntervalMillisecond(100);
```

```response
┌──────────────────bucket─┬─count─┐
│ 2023-03-24 00:24:03.000 │     0 │
│ 2023-03-24 00:24:03.100 │     0 │
│ 2023-03-24 00:24:03.200 │     0 │
│ 2023-03-24 00:24:03.300 │     0 │
│ 2023-03-24 00:24:03.400 │     0 │
│ 2023-03-24 00:24:03.500 │     0 │
│ 2023-03-24 00:24:03.600 │     1 │
│ 2023-03-24 00:24:03.700 │     0 │
│ 2023-03-24 00:24:03.800 │     1 │
│ 2023-03-24 00:24:03.900 │     1 │
│ 2023-03-24 00:24:04.000 │     0 │
│ 2023-03-24 00:24:04.100 │     0 │
│ 2023-03-24 00:24:04.200 │     0 │
│ 2023-03-24 00:24:04.300 │     1 │
│ 2023-03-24 00:24:04.400 │     1 │
│ 2023-03-24 00:24:04.500 │     0 │
│ 2023-03-24 00:24:04.600 │     0 │
│ 2023-03-24 00:24:04.700 │     0 │
│ 2023-03-24 00:24:04.800 │     1 │
│ 2023-03-24 00:24:04.900 │     0 │
│ 2023-03-24 00:24:05.000 │     0 │
└─────────────────────────┴───────┘
```

现在所有空白区间都已填充完毕，从 `00:24:03.000` 到 `00:24:05.000` 的每个 100 毫秒都有记录。

## 累计计数 {#cumulative-count}

假设我们现在希望对所有 bucket 中已创建图像的数量进行累计计数。
我们可以通过添加一个 `cumulative` 列来实现，如下所示：

```sql
SELECT
    toStartOfInterval(timestamp, toIntervalMillisecond(100)) AS bucket,
    count() AS count,
    sum(count) OVER (ORDER BY bucket) AS cumulative  -- 累积计数
FROM MidJourney.images
WHERE (timestamp >= {start:String}) AND (timestamp <= {end:String})
GROUP BY ALL
ORDER BY bucket ASC
WITH FILL
FROM toDateTime64({start:String}, 3)
TO toDateTime64({end:String}, 3) + INTERVAL 1 millisecond
STEP toIntervalMillisecond(100);
```

```response
┌──────────────────bucket─┬─count─┬─cumulative─┐
│ 2023-03-24 00:24:03.000 │     0 │          0 │
│ 2023-03-24 00:24:03.100 │     0 │          0 │
│ 2023-03-24 00:24:03.200 │     0 │          0 │
│ 2023-03-24 00:24:03.300 │     0 │          0 │
│ 2023-03-24 00:24:03.400 │     0 │          0 │
│ 2023-03-24 00:24:03.500 │     0 │          0 │
│ 2023-03-24 00:24:03.600 │     1 │          1 │
│ 2023-03-24 00:24:03.700 │     0 │          0 │
│ 2023-03-24 00:24:03.800 │     1 │          2 │
│ 2023-03-24 00:24:03.900 │     1 │          3 │
│ 2023-03-24 00:24:04.000 │     0 │          0 │
│ 2023-03-24 00:24:04.100 │     0 │          0 │
│ 2023-03-24 00:24:04.200 │     0 │          0 │
│ 2023-03-24 00:24:04.300 │     1 │          4 │
│ 2023-03-24 00:24:04.400 │     1 │          5 │
│ 2023-03-24 00:24:04.500 │     0 │          0 │
│ 2023-03-24 00:24:04.600 │     0 │          0 │
│ 2023-03-24 00:24:04.700 │     0 │          0 │
│ 2023-03-24 00:24:04.800 │     1 │          6 │
│ 2023-03-24 00:24:04.900 │     0 │          0 │
│ 2023-03-24 00:24:05.000 │     0 │          0 │
└─────────────────────────┴───────┴────────────┘
```

累积列中的值未按我们期望的方式运行。

## WITH FILL...INTERPOLATE {#with-fillinterpolate}

在 `count` 列中值为 `0` 的所有行，其 `cumulative` 列中的值同样是 `0`，而我们更希望这些行在 `cumulative` 列中沿用前一行的值。
我们可以通过使用 `INTERPOLATE` 子句来实现，如下所示：

```sql
SELECT
    toStartOfInterval(timestamp, toIntervalMillisecond(100)) AS bucket,
    count() AS count,
    sum(count) OVER (ORDER BY bucket) AS cumulative
FROM MidJourney.images
WHERE (timestamp >= {start:String}) AND (timestamp <= {end:String})
GROUP BY ALL
ORDER BY bucket ASC
WITH FILL
FROM toDateTime64({start:String}, 3)
TO toDateTime64({end:String}, 3) + INTERVAL 100 millisecond
STEP toIntervalMillisecond(100)
INTERPOLATE (cumulative);
```

```response
┌──────────────────bucket─┬─count─┬─cumulative─┐
│ 2023-03-24 00:24:03.000 │     0 │          0 │
│ 2023-03-24 00:24:03.100 │     0 │          0 │
│ 2023-03-24 00:24:03.200 │     0 │          0 │
│ 2023-03-24 00:24:03.300 │     0 │          0 │
│ 2023-03-24 00:24:03.400 │     0 │          0 │
│ 2023-03-24 00:24:03.500 │     0 │          0 │
│ 2023-03-24 00:24:03.600 │     1 │          1 │
│ 2023-03-24 00:24:03.700 │     0 │          1 │
│ 2023-03-24 00:24:03.800 │     1 │          2 │
│ 2023-03-24 00:24:03.900 │     1 │          3 │
│ 2023-03-24 00:24:04.000 │     0 │          3 │
│ 2023-03-24 00:24:04.100 │     0 │          3 │
│ 2023-03-24 00:24:04.200 │     0 │          3 │
│ 2023-03-24 00:24:04.300 │     1 │          4 │
│ 2023-03-24 00:24:04.400 │     1 │          5 │
│ 2023-03-24 00:24:04.500 │     0 │          5 │
│ 2023-03-24 00:24:04.600 │     0 │          5 │
│ 2023-03-24 00:24:04.700 │     0 │          5 │
│ 2023-03-24 00:24:04.800 │     1 │          6 │
│ 2023-03-24 00:24:04.900 │     0 │          6 │
│ 2023-03-24 00:24:05.000 │     0 │          6 │
└─────────────────────────┴───────┴────────────┘
```

看起来好多了。
最后，为了完成整个过程，让我们使用 `bar` 函数添加一个柱状图，并且别忘了在 `INTERPOLATE` 子句中加入我们的新列。

```sql
SELECT
    toStartOfInterval(timestamp, toIntervalMillisecond(100)) AS bucket,
    count() AS count,
    sum(count) OVER (ORDER BY bucket) AS cumulative,
    bar(cumulative, 0, 10, 10) AS barChart
FROM MidJourney.images
WHERE (timestamp >= {start:String}) AND (timestamp <= {end:String})
GROUP BY ALL
ORDER BY bucket ASC
WITH FILL
FROM toDateTime64({start:String}, 3)
TO toDateTime64({end:String}, 3) + INTERVAL 100 millisecond
STEP toIntervalMillisecond(100)
INTERPOLATE (cumulative, barChart);
```

```response
┌──────────────────bucket─┬─count─┬─cumulative─┬─barChart─┐
│ 2023-03-24 00:24:03.000 │     0 │          0 │          │
│ 2023-03-24 00:24:03.100 │     0 │          0 │          │
│ 2023-03-24 00:24:03.200 │     0 │          0 │          │
│ 2023-03-24 00:24:03.300 │     0 │          0 │          │
│ 2023-03-24 00:24:03.400 │     0 │          0 │          │
│ 2023-03-24 00:24:03.500 │     0 │          0 │          │
│ 2023-03-24 00:24:03.600 │     1 │          1 │ █        │
│ 2023-03-24 00:24:03.700 │     0 │          1 │ █        │
│ 2023-03-24 00:24:03.800 │     1 │          2 │ ██       │
│ 2023-03-24 00:24:03.900 │     1 │          3 │ ███      │
│ 2023-03-24 00:24:04.000 │     0 │          3 │ ███      │
│ 2023-03-24 00:24:04.100 │     0 │          3 │ ███      │
│ 2023-03-24 00:24:04.200 │     0 │          3 │ ███      │
│ 2023-03-24 00:24:04.300 │     1 │          4 │ ████     │
│ 2023-03-24 00:24:04.400 │     1 │          5 │ █████    │
│ 2023-03-24 00:24:04.500 │     0 │          5 │ █████    │
│ 2023-03-24 00:24:04.600 │     0 │          5 │ █████    │
│ 2023-03-24 00:24:04.700 │     0 │          5 │ █████    │
│ 2023-03-24 00:24:04.800 │     1 │          6 │ ██████   │
│ 2023-03-24 00:24:04.900 │     0 │          6 │ ██████   │
│ 2023-03-24 00:24:05.000 │     0 │          6 │ ██████   │
└─────────────────────────┴───────┴────────────┴──────────┘
```
