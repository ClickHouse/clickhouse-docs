---
description: '窗口函数概览'
sidebar_label: '窗口函数'
sidebar_position: 1
slug: /sql-reference/window-functions/
title: '窗口函数'
doc_type: 'reference'
---



# 窗口函数  {#window-functions}

窗口函数可以在与当前行相关的一组行上执行计算。
其中有些计算类似于使用聚合函数所能完成的计算，但窗口函数不会将多行合并为单个结果——每一行仍然会单独返回。



## 标准窗口函数 {#standard-window-functions}

ClickHouse 支持用于定义窗口和窗口函数的标准语法。下表说明各功能当前是否受支持。

| 功能                                                                  | 是否支持                                                                                                                                                                       |
|--------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 临时（ad hoc）窗口定义（`count(*) over (partition by id order by time desc)`) | ✅                                                                                                                                                                                  |
| 包含窗口函数的表达式，例如 `(count(*) over ()) / 2`             | ✅                                                                                                                                                                                   |
| `WINDOW` 子句（`select ... from table window w as (partition by id)`）            | ✅                                                                                                                                                                                   |
| `ROWS` 窗口帧                                                                       | ✅                                                                                                                                                                                   |
| `RANGE` 窗口帧                                                                      | ✅（默认）                                                                                                                                                                      |
| `DateTime` 类型 `RANGE OFFSET` 窗口帧的 `INTERVAL` 语法                              | ❌（请改为直接指定秒数（`RANGE` 可与任意数值类型一起使用）。）                                                                                                                                 |
| `GROUPS` 窗口帧                                                                     | ❌                                                                                                                                                                               |
| 在窗口帧上计算聚合函数（`sum(value) over (order by time)`）   | ✅（支持所有聚合函数）                                                                                                                                                       |
| `rank()`, `dense_rank()`, `row_number()`                                           | ✅ <br/>别名：`denseRank()`                                                                                                                                                                                   |
| `percent_rank()` | ✅ 高效计算数据集中某个值在其分区内的相对排名。该函数可有效替代更冗长且计算开销更大的手动 SQL 计算：`ifNull((rank() OVER(PARTITION BY x ORDER BY y) - 1) / nullif(count(1) OVER(PARTITION BY x) - 1, 0), 0)` <br/>别名：`percentRank()`| 
| `cume_dist()` | ✅ 计算某个值在一组值中的累积分布比例。返回值为小于或等于当前行值的行数所占的百分比。 | 
| `lag/lead(value, offset)`                                                          | ✅ <br/> 你还可以使用以下任一变通方式：<br/> 1) `any(value) over (.... rows between &lt;offset&gt; preceding and &lt;offset&gt; preceding)`，对于 `lead` 使用 `following` <br/> 2) 使用 `lagInFrame/leadInFrame`，其行为类似，但会遵循窗口帧定义。若要获得与 `lag/lead` 完全相同的行为，请使用 `rows between unbounded preceding and unbounded following`                                                                 |
| `ntile(buckets)` | ✅ <br/> 以如下方式指定窗口：`partition by x order by y rows between unbounded preceding and unbounded following`。 |



## ClickHouse 特定窗口函数 {#clickhouse-specific-window-functions}

ClickHouse 还提供以下特定窗口函数:

### nonNegativeDerivative(metric_column, timestamp_column[, INTERVAL X UNITS]) {#nonnegativederivativemetric_column-timestamp_column-interval-x-units}

根据 `timestamp_column` 计算给定 `metric_column` 的非负导数。
`INTERVAL` 可省略,默认为 `INTERVAL 1 SECOND`。
每行的计算值如下:

- 第 1 行为 `0`,
- 第 $i$ 行为 ${\text{metric}_i - \text{metric}_{i-1} \over \text{timestamp}_i - \text{timestamp}_{i-1}}  * \text{interval}$。


## 语法 {#syntax}

```text
aggregate_function (column_name)
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column] 
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column]])
```

* `PARTITION BY` - 定义如何将结果集划分为多个组。
* `ORDER BY` - 定义在计算 `aggregate_function` 时，如何对组内的行进行排序。
* `ROWS or RANGE` - 定义窗口框架的边界，`aggregate_function` 在该框架内进行计算。
* `WINDOW` - 允许多个表达式复用同一个窗口定义。

```text
      分区
┌─────────────────┐  <-- UNBOUNDED PRECEDING (分区起始)
│                 │
│                 │
│=================│  <-- N PRECEDING  <─┐
│      N 行       │                     │  窗
│  当前行之前     │                     │  口
│~~~~~~~~~~~~~~~~~│  <-- CURRENT ROW    │  框
│     M 行        │                     │  架
│   当前行之后    │                     │  
│=================│  <-- M FOLLOWING  <─┘
│                 │
│                 │
└─────────────────┘  <--- UNBOUNDED FOLLOWING (分区结束)
```

### 函数 {#functions}

这些函数只能用作窗口函数。

* [`row_number()`](./row_number.md) - 从 1 开始为其分区内的当前行编号。
* [`first_value(x)`](./first_value.md) - 返回在其有序窗口中计算得到的第一个值。
* [`last_value(x)`](./last_value.md) - 返回在其有序窗口中计算得到的最后一个值。
* [`nth_value(x, offset)`](./nth_value.md) - 返回在其有序窗口中，针对第 n 行（由 offset 指定）计算得到的第一个非 NULL 值。
* [`rank()`](./rank.md) - 在其分区内对当前行进行排名，排名之间可能存在空缺。
* [`dense_rank()`](./dense_rank.md) - 在其分区内对当前行进行连续排名，不存在空缺。
* [`lagInFrame(x)`](./lagInFrame.md) - 返回在其有序窗口中，相对于当前行之前指定物理偏移量那一行计算得到的值。
* [`leadInFrame(x)`](./leadInFrame.md) - 返回在其有序窗口中，相对于当前行之后指定偏移量那一行计算得到的值。


## 示例 {#examples}

我们来看一些使用窗口函数的示例。

### 为行编号 {#numbering-rows}

```sql
CREATE TABLE salaries
(
    `team` String,
    `player` String,
    `salary` UInt32,
    `position` String
)
Engine = Memory;

INSERT INTO salaries FORMAT Values
    ('Port Elizabeth Barbarians', 'Gary Chen', 195000, 'F'),
    ('New Coreystad Archdukes', 'Charles Juarez', 190000, 'F'),
    ('Port Elizabeth Barbarians', 'Michael Stanley', 150000, 'D'),
    ('New Coreystad Archdukes', 'Scott Harrison', 150000, 'D'),
    ('Port Elizabeth Barbarians', 'Robert George', 195000, 'M');
```

```sql
SELECT
    player,
    salary,
    row_number() OVER (ORDER BY salary ASC) AS row
FROM salaries;
```

```text
┌─player──────────┬─salary─┬─row─┐
│ Michael Stanley │ 150000 │   1 │
│ Scott Harrison  │ 150000 │   2 │
│ Charles Juarez  │ 190000 │   3 │
│ Gary Chen       │ 195000 │   4 │
│ Robert George   │ 195000 │   5 │
└─────────────────┴────────┴─────┘
```

```sql
SELECT
    player,
    salary,
    row_number() OVER (ORDER BY salary ASC) AS row,
    rank() OVER (ORDER BY salary ASC) AS rank,
    dense_rank() OVER (ORDER BY salary ASC) AS denseRank
FROM salaries;
```

```text
┌─player──────────┬─salary─┬─row─┬─rank─┬─denseRank─┐
│ Michael Stanley │ 150000 │   1 │    1 │         1 │
│ Scott Harrison  │ 150000 │   2 │    1 │         1 │
│ Charles Juarez  │ 190000 │   3 │    3 │         2 │
│ Gary Chen       │ 195000 │   4 │    4 │         3 │
│ Robert George   │ 195000 │   5 │    4 │         3 │
└─────────────────┴────────┴─────┴──────┴───────────┘
```

### 聚合函数 {#aggregation-functions}

将每位球员的薪水与其所在球队的平均薪水进行比较。

```sql
SELECT
    player,
    salary,
    team,
    avg(salary) OVER (PARTITION BY team) AS teamAvg,
    salary - teamAvg AS diff
FROM salaries;
```

```text
┌─player──────────┬─salary─┬─team──────────────────────┬─teamAvg─┬───diff─┐
│ Charles Juarez  │ 190000 │ New Coreystad Archdukes   │  170000 │  20000 │
│ Scott Harrison  │ 150000 │ New Coreystad Archdukes   │  170000 │ -20000 │
│ Gary Chen       │ 195000 │ Port Elizabeth Barbarians │  180000 │  15000 │
│ Michael Stanley │ 150000 │ Port Elizabeth Barbarians │  180000 │ -30000 │
│ Robert George   │ 195000 │ Port Elizabeth Barbarians │  180000 │  15000 │
└─────────────────┴────────┴───────────────────────────┴─────────┴────────┘
```

将每位球员的薪资与其所在球队的最高薪资进行对比。

```sql
SELECT
    player,
    salary,
    team,
    max(salary) OVER (PARTITION BY team) AS teamMax,
    salary - teamMax AS diff
FROM salaries;
```


```text
┌─球员────────────┬─薪水───┬─球队──────────────────────┬─队内最高┬───差额─┐
│ Charles Juarez  │ 190000 │ New Coreystad Archdukes   │  190000 │      0 │
│ Scott Harrison  │ 150000 │ New Coreystad Archdukes   │  190000 │ -40000 │
│ Gary Chen       │ 195000 │ Port Elizabeth Barbarians │  195000 │      0 │
│ Michael Stanley │ 150000 │ Port Elizabeth Barbarians │  195000 │ -45000 │
│ Robert George   │ 195000 │ Port Elizabeth Barbarians │  195000 │      0 │
└─────────────────┴────────┴───────────────────────────┴─────────┴────────┘
```

### 基于列的分区 {#partitioning-by-column}

```sql
CREATE TABLE wf_partition
(
    `part_key` UInt64,
    `value` UInt64,
    `order` UInt64    
)
ENGINE = Memory;

INSERT INTO wf_partition FORMAT Values
   (1,1,1), (1,2,2), (1,3,3), (2,0,0), (3,0,0);

SELECT
    part_key,
    value,
    order,
    groupArray(value) OVER (PARTITION BY part_key) AS frame_values
FROM wf_partition
ORDER BY
    part_key ASC,
    value ASC;

┌─part_key─┬─value─┬─order─┬─frame_values─┐
│        1 │     1 │     1 │ [1,2,3]      │   <┐   
│        1 │     2 │     2 │ [1,2,3]      │    │  第1组
│        1 │     3 │     3 │ [1,2,3]      │   <┘ 
│        2 │     0 │     0 │ [0]          │   <- 第2组
│        3 │     0 │     0 │ [0]          │   <- 第3组
└──────────┴───────┴───────┴──────────────┘
```

### 帧边界 {#frame-bounding}

```sql
CREATE TABLE wf_frame
(
    `part_key` UInt64,
    `value` UInt64,
    `order` UInt64
)
ENGINE = Memory;

INSERT INTO wf_frame FORMAT Values
   (1,1,1), (1,2,2), (1,3,3), (1,4,4), (1,5,5);
```

```sql
-- 框架范围由分区边界界定（BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING）
SELECT
    part_key,
    value,
    order,
    groupArray(value) OVER (
        PARTITION BY part_key 
        ORDER BY order ASC
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS frame_values
FROM wf_frame
ORDER BY
    part_key ASC,
    value ASC;
    
┌─part_key─┬─value─┬─order─┬─frame_values─┐
│        1 │     1 │     1 │ [1,2,3,4,5]  │
│        1 │     2 │     2 │ [1,2,3,4,5]  │
│        1 │     3 │     3 │ [1,2,3,4,5]  │
│        1 │     4 │     4 │ [1,2,3,4,5]  │
│        1 │     5 │     5 │ [1,2,3,4,5]  │
└──────────┴───────┴───────┴──────────────┘
```


```sql
-- 简写形式 - 无边界表达式,无 ORDER BY,
-- 等同于 `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`
SELECT
    part_key,
    value,
    order,
    groupArray(value) OVER (PARTITION BY part_key) AS frame_values_short,
    groupArray(value) OVER (PARTITION BY part_key
         ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS frame_values
FROM wf_frame
ORDER BY
    part_key ASC,
    value ASC;
┌─part_key─┬─value─┬─order─┬─frame_values_short─┬─frame_values─┐
│        1 │     1 │     1 │ [1,2,3,4,5]        │ [1,2,3,4,5]  │
│        1 │     2 │     2 │ [1,2,3,4,5]        │ [1,2,3,4,5]  │
│        1 │     3 │     3 │ [1,2,3,4,5]        │ [1,2,3,4,5]  │
│        1 │     4 │     4 │ [1,2,3,4,5]        │ [1,2,3,4,5]  │
│        1 │     5 │     5 │ [1,2,3,4,5]        │ [1,2,3,4,5]  │
└──────────┴───────┴───────┴────────────────────┴──────────────┘
```

```sql
-- 窗口框架范围从分区起始位置到当前行
SELECT
    part_key,
    value,
    order,
    groupArray(value) OVER (
        PARTITION BY part_key 
        ORDER BY order ASC
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS frame_values
FROM wf_frame
ORDER BY
    part_key ASC,
    value ASC;

┌─part_key─┬─value─┬─order─┬─frame_values─┐
│        1 │     1 │     1 │ [1]          │
│        1 │     2 │     2 │ [1,2]        │
│        1 │     3 │     3 │ [1,2,3]      │
│        1 │     4 │     4 │ [1,2,3,4]    │
│        1 │     5 │     5 │ [1,2,3,4,5]  │
└──────────┴───────┴───────┴──────────────┘
```

```sql
-- 简写形式（窗口帧范围从分区起始位置到当前行）
-- 等价于 `ORDER BY order ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`
SELECT
    part_key,
    value,
    order,
    groupArray(value) OVER (PARTITION BY part_key ORDER BY order ASC) AS frame_values_short,
    groupArray(value) OVER (PARTITION BY part_key ORDER BY order ASC
       ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS frame_values
FROM wf_frame
ORDER BY
    part_key ASC,
    value ASC;

┌─part_key─┬─value─┬─order─┬─frame_values_short─┬─frame_values─┐
│        1 │     1 │     1 │ [1]                │ [1]          │
│        1 │     2 │     2 │ [1,2]              │ [1,2]        │
│        1 │     3 │     3 │ [1,2,3]            │ [1,2,3]      │
│        1 │     4 │     4 │ [1,2,3,4]          │ [1,2,3,4]    │
│        1 │     5 │     5 │ [1,2,3,4,5]        │ [1,2,3,4,5]  │
└──────────┴───────┴───────┴────────────────────┴──────────────┘
```


```sql
-- 框架范围从分区起始位置到当前行，但排序为倒序
SELECT
    part_key,
    value,
    order,
    groupArray(value) OVER (PARTITION BY part_key ORDER BY order DESC) AS frame_values
FROM wf_frame
ORDER BY
    part_key ASC,
    value ASC;

┌─part_key─┬─value─┬─order─┬─frame_values─┐
│        1 │     1 │     1 │ [5,4,3,2,1]  │
│        1 │     2 │     2 │ [5,4,3,2]    │
│        1 │     3 │     3 │ [5,4,3]      │
│        1 │     4 │     4 │ [5,4]        │
│        1 │     5 │     5 │ [5]          │
└──────────┴───────┴───────┴──────────────┘
```

```sql
-- 滑动帧 - 前1行与当前行
SELECT
    part_key,
    value,
    order,
    groupArray(value) OVER (
        PARTITION BY part_key 
        ORDER BY order ASC
        ROWS BETWEEN 1 PRECEDING AND CURRENT ROW
    ) AS frame_values
FROM wf_frame
ORDER BY
    part_key ASC,
    value ASC;

┌─part_key─┬─value─┬─order─┬─frame_values─┐
│        1 │     1 │     1 │ [1]          │
│        1 │     2 │     2 │ [1,2]        │
│        1 │     3 │     3 │ [2,3]        │
│        1 │     4 │     4 │ [3,4]        │
│        1 │     5 │     5 │ [4,5]        │
└──────────┴───────┴───────┴──────────────┘
```

```sql
-- 滑动帧 - ROWS BETWEEN 1 PRECEDING AND UNBOUNDED FOLLOWING 
SELECT
    part_key,
    value,
    order,
    groupArray(value) OVER (
        PARTITION BY part_key 
        ORDER BY order ASC
        ROWS BETWEEN 1 PRECEDING AND UNBOUNDED FOLLOWING
    ) AS frame_values
FROM wf_frame
ORDER BY
    part_key ASC,
    value ASC;

┌─part_key─┬─value─┬─order─┬─frame_values─┐
│        1 │     1 │     1 │ [1,2,3,4,5]  │
│        1 │     2 │     2 │ [1,2,3,4,5]  │
│        1 │     3 │     3 │ [2,3,4,5]    │
│        1 │     4 │     4 │ [3,4,5]      │
│        1 │     5 │     5 │ [4,5]        │
└──────────┴───────┴───────┴──────────────┘
```

```sql
-- row_number 不受窗口帧限制,因此 rn_1 = rn_2 = rn_3 != rn_4
SELECT
    part_key,
    value,
    order,
    groupArray(value) OVER w1 AS frame_values,
    row_number() OVER w1 AS rn_1,
    sum(1) OVER w1 AS rn_2,
    row_number() OVER w2 AS rn_3,
    sum(1) OVER w2 AS rn_4
FROM wf_frame
WINDOW
    w1 AS (PARTITION BY part_key ORDER BY order DESC),
    w2 AS (
        PARTITION BY part_key 
        ORDER BY order DESC 
        ROWS BETWEEN 1 PRECEDING AND CURRENT ROW
    )
ORDER BY
    part_key ASC,
    value ASC;
```


┌─part&#95;key─┬─value─┬─order─┬─frame&#95;values─┬─rn&#95;1─┬─rn&#95;2─┬─rn&#95;3─┬─rn&#95;4─┐
│        1 │     1 │     1 │ [5,4,3,2,1]  │    5 │    5 │    5 │    2 │
│        1 │     2 │     2 │ [5,4,3,2]    │    4 │    4 │    4 │    2 │
│        1 │     3 │     3 │ [5,4,3]      │    3 │    3 │    3 │    2 │
│        1 │     4 │     4 │ [5,4]        │    2 │    2 │    2 │    2 │
│        1 │     5 │     5 │ [5]          │    1 │    1 │    1 │    1 │
└──────────┴───────┴───────┴──────────────┴──────┴──────┴──────┴──────┘

````

```sql
-- first_value 和 last_value 遵循窗口帧
SELECT
    groupArray(value) OVER w1 AS frame_values_1,
    first_value(value) OVER w1 AS first_value_1,
    last_value(value) OVER w1 AS last_value_1,
    groupArray(value) OVER w2 AS frame_values_2,
    first_value(value) OVER w2 AS first_value_2,
    last_value(value) OVER w2 AS last_value_2
FROM wf_frame
WINDOW
    w1 AS (PARTITION BY part_key ORDER BY order ASC),
    w2 AS (PARTITION BY part_key ORDER BY order ASC ROWS BETWEEN 1 PRECEDING AND CURRENT ROW)
ORDER BY
    part_key ASC,
    value ASC;

┌─frame_values_1─┬─first_value_1─┬─last_value_1─┬─frame_values_2─┬─first_value_2─┬─last_value_2─┐
│ [1]            │             1 │            1 │ [1]            │             1 │            1 │
│ [1,2]          │             1 │            2 │ [1,2]          │             1 │            2 │
│ [1,2,3]        │             1 │            3 │ [2,3]          │             2 │            3 │
│ [1,2,3,4]      │             1 │            4 │ [3,4]          │             3 │            4 │
│ [1,2,3,4,5]    │             1 │            5 │ [4,5]          │             4 │            5 │
└────────────────┴───────────────┴──────────────┴────────────────┴───────────────┴──────────────┘
````

```sql
-- 帧内的第二个值
SELECT
    groupArray(value) OVER w1 AS frame_values_1,
    nth_value(value, 2) OVER w1 AS second_value
FROM wf_frame
WINDOW w1 AS (PARTITION BY part_key ORDER BY order ASC ROWS BETWEEN 3 PRECEDING AND CURRENT ROW)
ORDER BY
    part_key ASC,
    value ASC;

┌─frame_values_1─┬─second_value─┐
│ [1]            │            0 │
│ [1,2]          │            2 │
│ [1,2,3]        │            2 │
│ [1,2,3,4]      │            2 │
│ [2,3,4,5]      │            3 │
└────────────────┴──────────────┘
```

```sql
-- 窗口帧内的第二个值 + 缺失值为 Null
SELECT
    groupArray(value) OVER w1 AS frame_values_1,
    nth_value(toNullable(value), 2) OVER w1 AS second_value
FROM wf_frame
WINDOW w1 AS (PARTITION BY part_key ORDER BY order ASC ROWS BETWEEN 3 PRECEDING AND CURRENT ROW)
ORDER BY
    part_key ASC,
    value ASC;
```


┌─frame&#95;values&#95;1─┬─second&#95;value─┐
│ [1]            │         ᴺᵁᴸᴸ │
│ [1,2]          │            2 │
│ [1,2,3]        │            2 │
│ [1,2,3,4]      │            2 │
│ [2,3,4,5]      │            3 │
└────────────────┴──────────────┘

```
```


## 实际案例 {#real-world-examples}

以下示例演示如何解决一些常见的实际问题。

### 各部门的最高/总薪资 {#maximumtotal-salary-per-department}

```sql
CREATE TABLE employees
(
    `department` String,
    `employee_name` String,
    `salary` Float
)
ENGINE = Memory;

INSERT INTO employees FORMAT Values
   ('Finance', 'Jonh', 200),
   ('Finance', 'Joan', 210),
   ('Finance', 'Jean', 505),
   ('IT', 'Tim', 200),
   ('IT', 'Anna', 300),
   ('IT', 'Elen', 500);
```

```sql
SELECT
    department,
    employee_name AS emp,
    salary,
    max_salary_per_dep,
    total_salary_per_dep,
    round((salary / total_salary_per_dep) * 100, 2) AS `share_per_dep(%)`
FROM
(
    SELECT
        department,
        employee_name,
        salary,
        max(salary) OVER wndw AS max_salary_per_dep,
        sum(salary) OVER wndw AS total_salary_per_dep
    FROM employees
    WINDOW wndw AS (
        PARTITION BY department
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    )
    ORDER BY
        department ASC,
        employee_name ASC
);

┌─department─┬─emp──┬─salary─┬─max_salary_per_dep─┬─total_salary_per_dep─┬─share_per_dep(%)─┐
│ Finance    │ Jean │    505 │                505 │                  915 │            55.19 │
│ Finance    │ Joan │    210 │                505 │                  915 │            22.95 │
│ Finance    │ Jonh │    200 │                505 │                  915 │            21.86 │
│ IT         │ Anna │    300 │                500 │                 1000 │               30 │
│ IT         │ Elen │    500 │                500 │                 1000 │               50 │
│ IT         │ Tim  │    200 │                500 │                 1000 │               20 │
└────────────┴──────┴────────┴────────────────────┴──────────────────────┴──────────────────┘
```

### 累积和 {#cumulative-sum}

```sql
CREATE TABLE warehouse
(
    `item` String,
    `ts` DateTime,
    `value` Float
)
ENGINE = Memory

INSERT INTO warehouse VALUES
    ('sku38', '2020-01-01', 9),
    ('sku38', '2020-02-01', 1),
    ('sku38', '2020-03-01', -4),
    ('sku1', '2020-01-01', 1),
    ('sku1', '2020-02-01', 1),
    ('sku1', '2020-03-01', 1);
```

```sql
SELECT
    item,
    ts,
    value,
    sum(value) OVER (PARTITION BY item ORDER BY ts ASC) AS stock_balance
FROM warehouse
ORDER BY
    item ASC,
    ts ASC;

┌─item──┬──────────────────ts─┬─value─┬─stock_balance─┐
│ sku1  │ 2020-01-01 00:00:00 │     1 │             1 │
│ sku1  │ 2020-02-01 00:00:00 │     1 │             2 │
│ sku1  │ 2020-03-01 00:00:00 │     1 │             3 │
│ sku38 │ 2020-01-01 00:00:00 │     9 │             9 │
│ sku38 │ 2020-02-01 00:00:00 │     1 │            10 │
│ sku38 │ 2020-03-01 00:00:00 │    -4 │             6 │
└───────┴─────────────────────┴───────┴───────────────┘
```

### 移动 / 滑动平均（每 3 行） {#moving--sliding-average-per-3-rows}

```sql
CREATE TABLE sensors
(
    `metric` String,
    `ts` DateTime,
    `value` Float
)
ENGINE = Memory;
```


insert into sensors values(&#39;cpu&#95;temp&#39;, &#39;2020-01-01 00:00:00&#39;, 87),
(&#39;cpu&#95;temp&#39;, &#39;2020-01-01 00:00:01&#39;, 77),
(&#39;cpu&#95;temp&#39;, &#39;2020-01-01 00:00:02&#39;, 93),
(&#39;cpu&#95;temp&#39;, &#39;2020-01-01 00:00:03&#39;, 87),
(&#39;cpu&#95;temp&#39;, &#39;2020-01-01 00:00:04&#39;, 87),
(&#39;cpu&#95;temp&#39;, &#39;2020-01-01 00:00:05&#39;, 87),
(&#39;cpu&#95;temp&#39;, &#39;2020-01-01 00:00:06&#39;, 87),
(&#39;cpu&#95;temp&#39;, &#39;2020-01-01 00:00:07&#39;, 87);

````

```sql
SELECT
    metric,
    ts,
    value,
    avg(value) OVER (
        PARTITION BY metric 
        ORDER BY ts ASC 
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) AS moving_avg_temp
FROM sensors
ORDER BY
    metric ASC,
    ts ASC;

┌─metric───┬──────────────────ts─┬─value─┬───moving_avg_temp─┐
│ cpu_temp │ 2020-01-01 00:00:00 │    87 │                87 │
│ cpu_temp │ 2020-01-01 00:00:01 │    77 │                82 │
│ cpu_temp │ 2020-01-01 00:00:02 │    93 │ 85.66666666666667 │
│ cpu_temp │ 2020-01-01 00:00:03 │    87 │ 85.66666666666667 │
│ cpu_temp │ 2020-01-01 00:00:04 │    87 │                89 │
│ cpu_temp │ 2020-01-01 00:00:05 │    87 │                87 │
│ cpu_temp │ 2020-01-01 00:00:06 │    87 │                87 │
│ cpu_temp │ 2020-01-01 00:00:07 │    87 │                87 │
└──────────┴─────────────────────┴───────┴───────────────────┘
````

### 移动/滑动平均（每 10 秒） {#moving--sliding-average-per-10-seconds}

```sql
SELECT
    metric,
    ts,
    value,
    avg(value) OVER (PARTITION BY metric ORDER BY ts
      RANGE BETWEEN 10 PRECEDING AND CURRENT ROW) AS moving_avg_10_seconds_temp
FROM sensors
ORDER BY
    metric ASC,
    ts ASC;
    
┌─metric───┬──────────────────ts─┬─value─┬─moving_avg_10_seconds_temp─┐
│ cpu_temp │ 2020-01-01 00:00:00 │    87 │                         87 │
│ cpu_temp │ 2020-01-01 00:01:10 │    77 │                         77 │
│ cpu_temp │ 2020-01-01 00:02:20 │    93 │                         93 │
│ cpu_temp │ 2020-01-01 00:03:30 │    87 │                         87 │
│ cpu_temp │ 2020-01-01 00:04:40 │    87 │                         87 │
│ cpu_temp │ 2020-01-01 00:05:50 │    87 │                         87 │
│ cpu_temp │ 2020-01-01 00:06:00 │    87 │                         87 │
│ cpu_temp │ 2020-01-01 00:07:10 │    87 │                         87 │
└──────────┴─────────────────────┴───────┴────────────────────────────┘
```

### 移动 / 滑动平均值（每 10 天） {#moving--sliding-average-per-10-days}

温度以秒级精度存储，但通过使用 `Range` 和 `ORDER BY toDate(ts)`，我们构建了一个大小为 10 的窗口帧，并且由于使用了 `toDate(ts)`，该单位为天。

```sql
CREATE TABLE sensors
(
    `metric` String,
    `ts` DateTime,
    `value` Float
)
ENGINE = Memory;
```


insert into sensors values(&#39;ambient&#95;temp&#39;, &#39;2020-01-01 00:00:00&#39;, 16),
(&#39;ambient&#95;temp&#39;, &#39;2020-01-01 12:00:00&#39;, 16),
(&#39;ambient&#95;temp&#39;, &#39;2020-01-02 11:00:00&#39;, 9),
(&#39;ambient&#95;temp&#39;, &#39;2020-01-02 12:00:00&#39;, 9),\
(&#39;ambient&#95;temp&#39;, &#39;2020-02-01 10:00:00&#39;, 10),
(&#39;ambient&#95;temp&#39;, &#39;2020-02-01 12:00:00&#39;, 10),
(&#39;ambient&#95;temp&#39;, &#39;2020-02-10 12:00:00&#39;, 12),\
(&#39;ambient&#95;temp&#39;, &#39;2020-02-10 13:00:00&#39;, 12),
(&#39;ambient&#95;temp&#39;, &#39;2020-02-20 12:00:01&#39;, 16),
(&#39;ambient&#95;temp&#39;, &#39;2020-03-01 12:00:00&#39;, 16),
(&#39;ambient&#95;temp&#39;, &#39;2020-03-01 12:00:00&#39;, 16),
(&#39;ambient&#95;temp&#39;, &#39;2020-03-01 12:00:00&#39;, 16);

````

```sql
SELECT
    metric,
    ts,
    value,
    round(avg(value) OVER (PARTITION BY metric ORDER BY toDate(ts) 
       RANGE BETWEEN 10 PRECEDING AND CURRENT ROW),2) AS moving_avg_10_days_temp
FROM sensors
ORDER BY
    metric ASC,
    ts ASC;

┌─metric───────┬──────────────────ts─┬─value─┬─moving_avg_10_days_temp─┐
│ ambient_temp │ 2020-01-01 00:00:00 │    16 │                      16 │
│ ambient_temp │ 2020-01-01 12:00:00 │    16 │                      16 │
│ ambient_temp │ 2020-01-02 11:00:00 │     9 │                    12.5 │
│ ambient_temp │ 2020-01-02 12:00:00 │     9 │                    12.5 │
│ ambient_temp │ 2020-02-01 10:00:00 │    10 │                      10 │
│ ambient_temp │ 2020-02-01 12:00:00 │    10 │                      10 │
│ ambient_temp │ 2020-02-10 12:00:00 │    12 │                      11 │
│ ambient_temp │ 2020-02-10 13:00:00 │    12 │                      11 │
│ ambient_temp │ 2020-02-20 12:00:01 │    16 │                   13.33 │
│ ambient_temp │ 2020-03-01 12:00:00 │    16 │                      16 │
│ ambient_temp │ 2020-03-01 12:00:00 │    16 │                      16 │
│ ambient_temp │ 2020-03-01 12:00:00 │    16 │                      16 │
└──────────────┴─────────────────────┴───────┴─────────────────────────┘
````


## 参考资料 {#references}

### GitHub 议题 {#github-issues}

关于窗口函数初始支持的路线图，请参见[此 GitHub 议题](https://github.com/ClickHouse/ClickHouse/issues/18097)。

所有与窗口函数相关的 GitHub 议题都带有 [comp-window-functions](https://github.com/ClickHouse/ClickHouse/labels/comp-window-functions) 标签。

### 测试 {#tests}

以下测试文件包含当前已支持语法的示例：

https://github.com/ClickHouse/ClickHouse/blob/master/tests/performance/window_functions.xml

https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/01591_window_functions.sql

### Postgres 文档 {#postgres-docs}

https://www.postgresql.org/docs/current/sql-select.html#SQL-WINDOW

https://www.postgresql.org/docs/devel/sql-expressions.html#SYNTAX-WINDOW-FUNCTIONS

https://www.postgresql.org/docs/devel/functions-window.html

https://www.postgresql.org/docs/devel/tutorial-window.html

### MySQL 文档 {#mysql-docs}

https://dev.mysql.com/doc/refman/8.0/en/window-function-descriptions.html

https://dev.mysql.com/doc/refman/8.0/en/window-functions-usage.html

https://dev.mysql.com/doc/refman/8.0/en/window-functions-frames.html



## 相关内容 {#related-content}

- 博客：[在 ClickHouse 中处理时间序列数据](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
- 博客：[用于 Git 提交序列的窗口和数组函数](https://clickhouse.com/blog/clickhouse-window-array-functions-git-commits)
- 博客：[将数据导入 ClickHouse（第 3 部分：使用 S3）](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3)
