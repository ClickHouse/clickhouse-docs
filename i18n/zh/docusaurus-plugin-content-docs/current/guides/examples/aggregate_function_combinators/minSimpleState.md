---
slug: '/examples/aggregate-function-combinators/minSimpleState'
title: 'minSimpleState'
description: 'minSimpleState 组合器的使用示例'
keywords: ['min', 'state', 'simple', 'combinator', 'examples', 'minSimpleState']
sidebar_label: 'minSimpleState'
doc_type: 'reference'
---

# minSimpleState {#minsimplestate}

## 描述 {#description}

[`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) 组合器可以应用于 [`min`](/sql-reference/aggregate-functions/reference/min)
函数，用于返回所有输入值中的最小值。它返回的结果类型为 [`SimpleAggregateFunction`](/docs/sql-reference/data-types/simpleaggregatefunction)。

## 示例用法 {#example-usage}

来看一个使用表来跟踪每日温度读数的实际示例。对于每个地点，我们希望维护记录到的最低温度。使用带有 `min` 的 `SimpleAggregateFunction` 类型，在遇到更低的温度时会自动更新存储的值。

创建用于原始温度读数的源表：

```sql
CREATE TABLE raw_temperature_readings
(
    location_id UInt32,
    location_name String,
    temperature Int32,
    recorded_at DateTime DEFAULT now()
)
    ENGINE = MergeTree()
ORDER BY (location_id, recorded_at);
```

创建用于存储最小温度的聚合表：

```sql
CREATE TABLE temperature_extremes
(
    location_id UInt32,
    location_name String,
    min_temp SimpleAggregateFunction(min, Int32),  -- Stores minimum temperature
    max_temp SimpleAggregateFunction(max, Int32)   -- Stores maximum temperature
)
ENGINE = AggregatingMergeTree()
ORDER BY location_id;
```

创建一个增量物化视图，作为插入数据的触发器，
为每个位置维护最低和最高温度。

```sql
CREATE MATERIALIZED VIEW temperature_extremes_mv
TO temperature_extremes
AS SELECT
    location_id,
    location_name,
    minSimpleState(temperature) AS min_temp,     -- Using SimpleState combinator
    maxSimpleState(temperature) AS max_temp      -- Using SimpleState combinator
FROM raw_temperature_readings
GROUP BY location_id, location_name;
```

插入一些初始温度数据：

```sql
INSERT INTO raw_temperature_readings (location_id, location_name, temperature) VALUES
(1, 'North', 5),
(2, 'South', 15),
(3, 'West', 10),
(4, 'East', 8);
```

这些读数会由物化视图自动处理。我们来检查一下
当前状态：

```sql
SELECT
    location_id,
    location_name,
    min_temp,     -- Directly accessing the SimpleAggregateFunction values
    max_temp      -- No need for finalization function with SimpleAggregateFunction
FROM temperature_extremes
ORDER BY location_id;
```

```response
┌─location_id─┬─location_name─┬─min_temp─┬─max_temp─┐
│           1 │ North         │        5 │        5 │
│           2 │ South         │       15 │       15 │
│           3 │ West          │       10 │       10 │
│           4 │ East          │        8 │        8 │
└─────────────┴───────────────┴──────────┴──────────┘
```

继续写入一些数据：

```sql
INSERT INTO raw_temperature_readings (location_id, location_name, temperature) VALUES
    (1, 'North', 3),
    (2, 'South', 18),
    (3, 'West', 10),
    (1, 'North', 8),
    (4, 'East', 2);
```

在写入新数据后查看更新的极值：

```sql
SELECT
    location_id,
    location_name,
    min_temp,  
    max_temp
FROM temperature_extremes
ORDER BY location_id;
```

```response
┌─location_id─┬─location_name─┬─min_temp─┬─max_temp─┐
│           1 │ North         │        3 │        8 │
│           1 │ North         │        5 │        5 │
│           2 │ South         │       18 │       18 │
│           2 │ South         │       15 │       15 │
│           3 │ West          │       10 │       10 │
│           3 │ West          │       10 │       10 │
│           4 │ East          │        2 │        2 │
│           4 │ East          │        8 │        8 │
└─────────────┴───────────────┴──────────┴──────────┘
```

请注意上面我们为每个 location 插入了两个值。这是因为 parts 还没有被合并（并且尚未被 `AggregatingMergeTree` 聚合）。要从这些部分状态中得到最终结果，我们需要添加一个 `GROUP BY`：

```sql
SELECT
    location_id,
    location_name,
    min(min_temp) AS min_temp,  -- Aggregate across all parts 
    max(max_temp) AS max_temp   -- Aggregate across all parts
FROM temperature_extremes
GROUP BY location_id, location_name
ORDER BY location_id;
```

现在可以看到预期的结果：

```sql
┌─location_id─┬─location_name─┬─min_temp─┬─max_temp─┐
│           1 │ North         │        3 │        8 │
│           2 │ South         │       15 │       18 │
│           3 │ West          │       10 │       10 │
│           4 │ East          │        2 │        8 │
└─────────────┴───────────────┴──────────┴──────────┘
```

:::note
使用 `SimpleState` 时，就不需要再使用 `Merge` 组合器来合并部分聚合状态。
:::

## 另请参阅 {#see-also}
- [`min`](/sql-reference/aggregate-functions/reference/min)
- [`SimpleState 组合器`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [`SimpleAggregateFunction 类型`](/sql-reference/data-types/simpleaggregatefunction)
