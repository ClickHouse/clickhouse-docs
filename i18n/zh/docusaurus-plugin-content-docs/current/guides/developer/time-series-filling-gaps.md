---
slug: /guides/developer/time-series-filling-gaps
sidebar_label: 时间序列 - 填补空白
sidebar_position: 10
description: 填补时间序列数据中的空白。
keywords: ['时间序列', '填补空白']
---


# 填补时间序列数据中的空白

在处理时间序列数据时，由于数据缺失或不活跃，可能会出现数据空白。  
通常，我们不希望在查询数据时存在这些空白。在这种情况下，`WITH FILL`子句会非常有用。  
本指南讨论如何使用`WITH FILL`填补时间序列数据中的空白。

## 设置 {#setup}

想象一下，我们有以下表格用于存储由GenAI图像服务生成的图像元数据：

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

让我们导入一些记录：

```sql
INSERT INTO images VALUES (1088619203512250448, '2023-03-24 00:24:03.684', 1536, 1536, 2207289);
INSERT INTO images VALUES (1088619204040736859, '2023-03-24 00:24:03.810', 1024, 1024, 1928974);
INSERT INTO images VALUES (1088619204749561989, '2023-03-24 00:24:03.979', 1024, 1024, 1275619);
INSERT INTO images VALUES (1088619206431477862, '2023-03-24 00:24:04.380', 2048, 2048, 5985703);
INSERT INTO images VALUES (1088619206905434213, '2023-03-24 00:24:04.493', 1024, 1024, 1558455);
INSERT INTO images VALUES (1088619208524431510, '2023-03-24 00:24:04.879', 1024, 1024, 1494869);
INSERT INTO images VALUES (1088619208425437515, '2023-03-24 00:24:05.160', 1024, 1024, 1538451);
```

## 按区间查询 {#querying-by-bucket}

我们将探索2023年3月24日的`00:24:03`到`00:24:04`之间创建的图像，因此让我们为这些时间点创建一些参数：

```sql
SET param_start = '2023-03-24 00:24:03',
    param_end = '2023-03-24 00:24:04';
```

接下来，我们将编写一个查询，将数据分组为100毫秒的区间，并返回在该区间内创建的图像数量：

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

结果集只包括创建图像的区间，但是对于时间序列分析，我们可能希望返回每个100毫秒的区间，即使它没有任何条目。

## WITH FILL {#with-fill}

我们可以使用`WITH FILL`子句来填补这些空白。  
我们还将指定`STEP`，即要填补的间隔大小。  
对于`DateTime`类型，默认间隔为1秒，但我们想要填补100毫秒的间隔，因此让我们将步幅值设置为100毫秒：

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

我们可以看到间隔内的空白已用`count`列中的0值填补。

## WITH FILL...FROM {#with-fillfrom}

然而，在时间范围的开始处仍然存在空白，我们可以通过指定`FROM`来解决这个问题：

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

我们可以从结果中看到，从`00:24:03.000`到`00:24:03.500`的所有区间现在都出现了。

## WITH FILL...TO {#with-fillto}

然而，我们仍然错过了一些位于时间范围结束处的区间，我们可以通过提供一个`TO`值来填补这些区间。  
`TO`是排除的，因此我们将在结束时间上加上一小段时间，以确保它被包含：

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

现在所有的空白都已填补，我们有从`00:24:03.000`到`00:24:05.000`每个100毫秒的条目。

## 累计计数 {#cumulative-count}

假设我们现在想要保持在各区间间创建图像数量的累计计数。  
我们可以通过添加一个`cumulative`列来实现，如下所示：

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

累计列中的值没有按我们想要的方式工作。

## WITH FILL...INTERPOLATE {#with-fillinterpolate}

任何在`count`列中为`0`的行在累计列中也为`0`，而我们更希望它使用累计列中的前一个值。  
我们可以使用`INTERPOLATE`子句来实现这一点，如下所示：

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
最后，让我们使用`bar`函数添加一个柱状图，别忘了将我们的新列包含在`INTERPOLATE`子句中。

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
