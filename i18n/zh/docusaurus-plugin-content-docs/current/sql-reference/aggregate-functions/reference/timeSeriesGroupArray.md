---
description: '按时间戳升序排序时间序列。'
sidebar_position: 146
slug: /sql-reference/aggregate-functions/reference/timeSeriesGroupArray
title: 'timeSeriesGroupArray'
doc_type: 'reference'
---

# timeSeriesGroupArray

按照时间戳升序排序时间序列。

**语法**

```sql
timeSeriesGroupArray(timestamp, value)
```

**参数**

* `timestamp` - 样本的时间戳
* `value` - 与该 `timestamp` 对应的时间序列值

**返回值**

该函数返回一个由 (`timestamp`, `value`) 元组组成的数组，并按 `timestamp` 升序排序。
如果同一 `timestamp` 有多个值，则函数会选择其中最大的值。

**示例**

```sql
WITH
    [110, 120, 130, 140, 140, 100]::Array(UInt32) AS timestamps,
    [1, 6, 8, 17, 19, 5]::Array(Float32) AS values -- 与上述时间戳对应的值数组
SELECT timeSeriesGroupArray(timestamp, value)
FROM
(
    -- 此子查询将时间戳数组和值数组转换为 `timestamp`、`value` 行
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

还可以将多个时间戳和值样本作为大小相同的 `Array` 传入。使用数组参数时，同一个查询如下：

```sql
WITH
    [110, 120, 130, 140, 140, 100]::Array(UInt32) AS timestamps,
    [1, 6, 8, 17, 19, 5]::Array(Float32) AS values -- 与上述时间戳相对应的值数组
SELECT timeSeriesGroupArray(timestamps, values);
```

:::note
此函数为实验性功能，可通过将 `allow_experimental_ts_to_grid_aggregate_function` 设置为 `true` 来启用。
:::
