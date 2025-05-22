
# minSimpleState {#minsimplestate}

## Description {#description}

[`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) 组合器可以应用于 [`min`](/sql-reference/aggregate-functions/reference/min) 函数，以返回所有输入值中的最小值。它返回类型为 [`SimpleAggregateFunction`](/docs/sql-reference/data-types/simpleaggregatefunction) 的结果。

## Example Usage {#example-usage}

让我们看一个实际的例子，使用一个跟踪每日温度读数的表格。对于每个位置，我们希望保持记录的最低温度。使用 `SimpleAggregateFunction` 类型与 `min` 可以在遇到更低的温度时自动更新存储的值。

创建原始温度读数的源表：

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

创建一个聚合表来存储最低温度：

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

创建一个增量物化视图，作为插入数据的触发器，并维护每个位置的最低和最高温度。

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

插入一些初始的温度读数：

```sql
INSERT INTO raw_temperature_readings (location_id, location_name, temperature) VALUES
(1, 'North', 5),
(2, 'South', 15),
(3, 'West', 10),
(4, 'East', 8);
```

这些读数会自动被物化视图处理。让我们检查一下当前状态：

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

插入更多数据：

```sql
INSERT INTO raw_temperature_readings (location_id, location_name, temperature) VALUES
    (1, 'North', 3),
    (2, 'South', 18),
    (3, 'West', 10),
    (1, 'North', 8),
    (4, 'East', 2);
```

查看新数据后的更新极值：

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

请注意，上面我们为每个位置插入了两个值。这是因为分区片段尚未合并（并通过 `AggregatingMergeTree` 聚合）。为了从部分状态中获得最终结果，我们需要添加 `GROUP BY`：

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

现在我们得到了预期的结果：

```sql
┌─location_id─┬─location_name─┬─min_temp─┬─max_temp─┐
│           1 │ North         │        3 │        8 │
│           2 │ South         │       15 │       18 │
│           3 │ West          │       10 │       10 │
│           4 │ East          │        2 │        8 │
└─────────────┴───────────────┴──────────┴──────────┘
```

:::note
使用 `SimpleState`，您不需要使用 `Merge` 组合器来合并部分聚合状态。
:::

## See also {#see-also}
- [`min`](/sql-reference/aggregate-functions/reference/min)
- [`SimpleState combinator`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [`SimpleAggregateFunction type`](/sql-reference/data-types/simpleaggregatefunction)
