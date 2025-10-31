---
'description': '按时间戳升序排序时间序列。'
'sidebar_position': 146
'slug': '/sql-reference/aggregate-functions/reference/timeSeriesGroupArray'
'title': 'timeSeriesGroupArray'
'doc_type': 'reference'
---


# timeSeriesGroupArray

按时间戳升序排序时间序列。

**语法**

```sql
timeSeriesGroupArray(timestamp, value)
```

**参数**

- `timestamp` - 样本的时间戳
- `value` - 与 `timestamp` 对应的时间序列值

**返回值**

该函数返回一个元组数组（`timestamp`, `value`），按 `timestamp` 升序排序。
如果同一 `timestamp` 有多个值，则该函数选择其中最大的值。

**示例**

```sql
WITH
    [110, 120, 130, 140, 140, 100]::Array(UInt32) AS timestamps,
    [1, 6, 8, 17, 19, 5]::Array(Float32) AS values -- array of values corresponding to timestamps above
SELECT timeSeriesGroupArray(timestamp, value)
FROM
(
    -- This subquery converts arrays of timestamps and values into rows of `timestamp`, `value`
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

还可以将多个时间戳和对应值作为相同大小的数组传递。使用数组参数的相同查询：

```sql
WITH
    [110, 120, 130, 140, 140, 100]::Array(UInt32) AS timestamps,
    [1, 6, 8, 17, 19, 5]::Array(Float32) AS values -- array of values corresponding to timestamps above
SELECT timeSeriesGroupArray(timestamps, values);
```

:::note
此函数是实验性的，通过设置 `allow_experimental_ts_to_grid_aggregate_function=true` 启用它。
:::
