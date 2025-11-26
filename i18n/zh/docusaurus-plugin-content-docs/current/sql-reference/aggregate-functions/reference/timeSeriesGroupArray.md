---
description: '将时间序列按时间戳升序排序。'
sidebar_position: 146
slug: /sql-reference/aggregate-functions/reference/timeSeriesGroupArray
title: 'timeSeriesGroupArray'
doc_type: 'reference'
---

# timeSeriesGroupArray

按时间戳升序排序时间序列。

**语法**

```sql
timeSeriesGroupArray(时间戳, 值)
```

**参数**

* `timestamp` - 样本的时间戳
* `value` - 与该 `timestamp` 对应的时间序列值

**返回值**

该函数返回一个由元组 (`timestamp`, `value`) 组成的数组，并按 `timestamp` 升序排序。
如果同一 `timestamp` 存在多个值，则函数会从中选择最大值。

**示例**

```sql
WITH
    [110, 120, 130, 140, 140, 100]::Array(UInt32) AS timestamps,
    [1, 6, 8, 17, 19, 5]::Array(Float32) AS values -- 与上述时间戳一一对应的数值数组
SELECT timeSeriesGroupArray(timestamp, value)
FROM
(
    -- 此子查询将时间戳和数值这两个数组展开为多行 `timestamp`、`value`
    SELECT
        arrayJoin(arrayZip(timestamps, values)) AS ts_and_val,
        ts_and_val.1 AS timestamp,
        ts_and_val.2 AS value
);
```

响应：

```response
   ┌─timeSeriesGroupArray(timestamp, value)───────┐
1. │ [(100,5),(110,1),(120,6),(130,8),(140,19)]   │
   └──────────────────────────────────────────────┘
```

也可以将多个时间戳和值的样本以长度相同的数组形式传入。使用数组参数时，同一查询如下：

```sql
WITH
    [110, 120, 130, 140, 140, 100]::Array(UInt32) AS timestamps,
    [1, 6, 8, 17, 19, 5]::Array(Float32) AS values -- 对应于上述时间戳的数值数组
SELECT timeSeriesGroupArray(timestamps, values);
```

:::note
该函数处于实验阶段，可通过设置 `allow_experimental_ts_to_grid_aggregate_function=true` 来启用。
:::
