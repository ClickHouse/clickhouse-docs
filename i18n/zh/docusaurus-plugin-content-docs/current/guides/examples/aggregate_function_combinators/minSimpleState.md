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

[`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) 组合器可应用于 [`min`](/sql-reference/aggregate-functions/reference/min) 函数,用于返回所有输入值中的最小值。该函数返回类型为 [`SimpleAggregateFunction`](/docs/sql-reference/data-types/simpleaggregatefunction) 的结果。


## 使用示例 {#example-usage}

让我们通过一个实际示例来演示，该示例使用一个表来跟踪每日温度读数。对于每个位置，我们希望保留记录的最低温度。
使用带有 `min` 的 `SimpleAggregateFunction` 类型可以在遇到更低温度时自动更新存储的值。

创建用于存储原始温度读数的源表：

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

创建用于存储最低温度的聚合表：

```sql
CREATE TABLE temperature_extremes
(
    location_id UInt32,
    location_name String,
    min_temp SimpleAggregateFunction(min, Int32),  -- 存储最低温度
    max_temp SimpleAggregateFunction(max, Int32)   -- 存储最高温度
)
ENGINE = AggregatingMergeTree()
ORDER BY location_id;
```

创建一个增量物化视图，它将作为插入数据的触发器，并维护每个位置的最低和最高温度。

```sql
CREATE MATERIALIZED VIEW temperature_extremes_mv
TO temperature_extremes
AS SELECT
    location_id,
    location_name,
    minSimpleState(temperature) AS min_temp,     -- 使用 SimpleState 组合器
    maxSimpleState(temperature) AS max_temp      -- 使用 SimpleState 组合器
FROM raw_temperature_readings
GROUP BY location_id, location_name;
```

插入一些初始温度读数：

```sql
INSERT INTO raw_temperature_readings (location_id, location_name, temperature) VALUES
(1, 'North', 5),
(2, 'South', 15),
(3, 'West', 10),
(4, 'East', 8);
```

这些读数会被物化视图自动处理。让我们检查当前状态：

```sql
SELECT
    location_id,
    location_name,
    min_temp,     -- 直接访问 SimpleAggregateFunction 值
    max_temp      -- 使用 SimpleAggregateFunction 无需终结函数
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

插入更多数据：

```sql
INSERT INTO raw_temperature_readings (location_id, location_name, temperature) VALUES
    (1, 'North', 3),
    (2, 'South', 18),
    (3, 'West', 10),
    (1, 'North', 8),
    (4, 'East', 2);
```

查看新数据插入后更新的极值：

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

注意上面每个位置都有两个插入的值。这是因为数据分区尚未合并（并由 `AggregatingMergeTree` 聚合）。要从部分状态获取最终结果，我们需要添加 `GROUP BY`：

```sql
SELECT
    location_id,
    location_name,
    min(min_temp) AS min_temp,  -- 跨所有分区聚合
    max(max_temp) AS max_temp   -- 跨所有分区聚合
FROM temperature_extremes
GROUP BY location_id, location_name
ORDER BY location_id;
```

现在我们得到了预期的结果：


```sql
┌─location_id─┬─location_name─┬─min_temp─┬─max_temp─┐
│           1 │ 北区         │        3 │        8 │
│           2 │ 南区         │       15 │       18 │
│           3 │ 西区          │       10 │       10 │
│           4 │ 东区          │        2 │        8 │
└─────────────┴───────────────┴──────────┴──────────┘
```

:::note
使用 `SimpleState` 时，无需再使用 `Merge` 组合器来合并部分聚合状态。
:::


## 另请参阅 {#see-also}

- [`min`](/sql-reference/aggregate-functions/reference/min)
- [`SimpleState 组合器`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [`SimpleAggregateFunction 类型`](/sql-reference/data-types/simpleaggregatefunction)
