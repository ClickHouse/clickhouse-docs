---
'description': '计算在确定时间内值的指数移动平均。'
'sidebar_position': 132
'slug': '/sql-reference/aggregate-functions/reference/exponentialMovingAverage'
'title': 'exponentialMovingAverage'
'doc_type': 'reference'
---

## exponentialMovingAverage {#exponentialmovingaverage}

计算在确定时间内值的指数移动平均。

**语法**

```sql
exponentialMovingAverage(x)(value, timeunit)
```

每个 `value` 对应于确定的 `timeunit`。半衰期 `x` 是指数权重衰减到一半的时间延迟。该函数返回加权平均值：时间点越旧，考虑的对应值的权重就越小。

**参数**

- `value` — 值。 [整数](../../../sql-reference/data-types/int-uint.md), [浮点数](../../../sql-reference/data-types/float.md) 或 [小数](../../../sql-reference/data-types/decimal.md)。
- `timeunit` — 时间单位。[整数](../../../sql-reference/data-types/int-uint.md), [浮点数](../../../sql-reference/data-types/float.md) 或 [小数](../../../sql-reference/data-types/decimal.md)。时间单位不是时间戳（秒），而是时间间隔的索引。可以使用 [intDiv](/sql-reference/functions/arithmetic-functions#intDiv) 进行计算。

**参数**

- `x` — 半衰期。 [整数](../../../sql-reference/data-types/int-uint.md), [浮点数](../../../sql-reference/data-types/float.md) 或 [小数](../../../sql-reference/data-types/decimal.md)。

**返回值**

- 返回过去 `x` 时间在最新时间点的值的 [指数平滑移动平均](https://en.wikipedia.org/wiki/Moving_average#Exponential_moving_average)。

类型：[Float64](/sql-reference/data-types/float)。

**示例**

输入表：

```text
┌──temperature─┬─timestamp──┐
│          95  │         1  │
│          95  │         2  │
│          95  │         3  │
│          96  │         4  │
│          96  │         5  │
│          96  │         6  │
│          96  │         7  │
│          97  │         8  │
│          97  │         9  │
│          97  │        10  │
│          97  │        11  │
│          98  │        12  │
│          98  │        13  │
│          98  │        14  │
│          98  │        15  │
│          99  │        16  │
│          99  │        17  │
│          99  │        18  │
│         100  │        19  │
│         100  │        20  │
└──────────────┴────────────┘
```

查询：

```sql
SELECT exponentialMovingAverage(5)(temperature, timestamp);
```

结果：

```text
┌──exponentialMovingAverage(5)(temperature, timestamp)──┐
│                                    92.25779635374204  │
└───────────────────────────────────────────────────────┘
```

查询：

```sql
SELECT
    value,
    time,
    round(exp_smooth, 3),
    bar(exp_smooth, 0, 1, 50) AS bar
FROM
(
    SELECT
        (number = 0) OR (number >= 25) AS value,
        number AS time,
        exponentialMovingAverage(10)(value, time) OVER (Rows BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS exp_smooth
    FROM numbers(50)
)
```

结果：

```text
┌─value─┬─time─┬─round(exp_smooth, 3)─┬─bar────────────────────────────────────────┐
│     1 │    0 │                0.067 │ ███▎                                       │
│     0 │    1 │                0.062 │ ███                                        │
│     0 │    2 │                0.058 │ ██▊                                        │
│     0 │    3 │                0.054 │ ██▋                                        │
│     0 │    4 │                0.051 │ ██▌                                        │
│     0 │    5 │                0.047 │ ██▎                                        │
│     0 │    6 │                0.044 │ ██▏                                        │
│     0 │    7 │                0.041 │ ██                                         │
│     0 │    8 │                0.038 │ █▊                                         │
│     0 │    9 │                0.036 │ █▋                                         │
│     0 │   10 │                0.033 │ █▋                                         │
│     0 │   11 │                0.031 │ █▌                                         │
│     0 │   12 │                0.029 │ █▍                                         │
│     0 │   13 │                0.027 │ █▎                                         │
│     0 │   14 │                0.025 │ █▎                                         │
│     0 │   15 │                0.024 │ █▏                                         │
│     0 │   16 │                0.022 │ █                                          │
│     0 │   17 │                0.021 │ █                                          │
│     0 │   18 │                0.019 │ ▊                                          │
│     0 │   19 │                0.018 │ ▊                                          │
│     0 │   20 │                0.017 │ ▋                                          │
│     0 │   21 │                0.016 │ ▋                                          │
│     0 │   22 │                0.015 │ ▋                                          │
│     0 │   23 │                0.014 │ ▋                                          │
│     0 │   24 │                0.013 │ ▋                                          │
│     1 │   25 │                0.079 │ ███▊                                       │
│     1 │   26 │                 0.14 │ ███████                                    │
│     1 │   27 │                0.198 │ █████████▊                                 │
│     1 │   28 │                0.252 │ ████████████▌                              │
│     1 │   29 │                0.302 │ ███████████████                            │
│     1 │   30 │                0.349 │ █████████████████▍                         │
│     1 │   31 │                0.392 │ ███████████████████▌                       │
│     1 │   32 │                0.433 │ █████████████████████▋                     │
│     1 │   33 │                0.471 │ ███████████████████████▌                   │
│     1 │   34 │                0.506 │ █████████████████████████▎                 │
│     1 │   35 │                0.539 │ ██████████████████████████▊                │
│     1 │   36 │                 0.57 │ ████████████████████████████▌              │
│     1 │   37 │                0.599 │ █████████████████████████████▊             │
│     1 │   38 │                0.626 │ ███████████████████████████████▎           │
│     1 │   39 │                0.651 │ ████████████████████████████████▌          │
│     1 │   40 │                0.674 │ █████████████████████████████████▋         │
│     1 │   41 │                0.696 │ ██████████████████████████████████▋        │
│     1 │   42 │                0.716 │ ███████████████████████████████████▋       │
│     1 │   43 │                0.735 │ ████████████████████████████████████▋      │
│     1 │   44 │                0.753 │ █████████████████████████████████████▋     │
│     1 │   45 │                 0.77 │ ██████████████████████████████████████▍    │
│     1 │   46 │                0.785 │ ███████████████████████████████████████▎   │
│     1 │   47 │                  0.8 │ ███████████████████████████████████████▊   │  
│     1 │   48 │                0.813 │ ████████████████████████████████████████▋  │
│     1 │   49 │                0.825 │ █████████████████████████████████████████▎ │
└───────┴──────┴──────────────────────┴────────────────────────────────────────────┘
```

```sql
CREATE TABLE data
ENGINE = Memory AS
SELECT
    10 AS value,
    toDateTime('2020-01-01') + (3600 * number) AS time
FROM numbers_mt(10);
-- Calculate timeunit using intDiv
SELECT
    value,
    time,
    exponentialMovingAverage(1)(value, intDiv(toUInt32(time), 3600)) OVER (ORDER BY time ASC) AS res,
    intDiv(toUInt32(time), 3600) AS timeunit
FROM data
ORDER BY time ASC;

┌─value─┬────────────────time─┬─────────res─┬─timeunit─┐
│    10 │ 2020-01-01 00:00:00 │           5 │   438288 │
│    10 │ 2020-01-01 01:00:00 │         7.5 │   438289 │
│    10 │ 2020-01-01 02:00:00 │        8.75 │   438290 │
│    10 │ 2020-01-01 03:00:00 │       9.375 │   438291 │
│    10 │ 2020-01-01 04:00:00 │      9.6875 │   438292 │
│    10 │ 2020-01-01 05:00:00 │     9.84375 │   438293 │
│    10 │ 2020-01-01 06:00:00 │    9.921875 │   438294 │
│    10 │ 2020-01-01 07:00:00 │   9.9609375 │   438295 │
│    10 │ 2020-01-01 08:00:00 │  9.98046875 │   438296 │
│    10 │ 2020-01-01 09:00:00 │ 9.990234375 │   438297 │
└───────┴─────────────────────┴─────────────┴──────────┘
-- Calculate timeunit using toRelativeHourNum
SELECT
    value,
    time,
    exponentialMovingAverage(1)(value, toRelativeHourNum(time)) OVER (ORDER BY time ASC) AS res,
    toRelativeHourNum(time) AS timeunit
FROM data
ORDER BY time ASC;

┌─value─┬────────────────time─┬─────────res─┬─timeunit─┐
│    10 │ 2020-01-01 00:00:00 │           5 │   438288 │
│    10 │ 2020-01-01 01:00:00 │         7.5 │   438289 │
│    10 │ 2020-01-01 02:00:00 │        8.75 │   438290 │
│    10 │ 2020-01-01 03:00:00 │       9.375 │   438291 │
│    10 │ 2020-01-01 04:00:00 │      9.6875 │   438292 │
│    10 │ 2020-01-01 05:00:00 │     9.84375 │   438293 │
│    10 │ 2020-01-01 06:00:00 │    9.921875 │   438294 │
│    10 │ 2020-01-01 07:00:00 │   9.9609375 │   438295 │
│    10 │ 2020-01-01 08:00:00 │  9.98046875 │   438296 │
│    10 │ 2020-01-01 09:00:00 │ 9.990234375 │   438297 │
└───────┴─────────────────────┴─────────────┴──────────┘
```
