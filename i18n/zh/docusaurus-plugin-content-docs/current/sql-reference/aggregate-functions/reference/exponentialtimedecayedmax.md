---
slug: /sql-reference/aggregate-functions/reference/exponentialTimeDecayedMax
sidebar_position: 135
title: 'exponentialTimeDecayedMax'
description: '返回在时间索引 `t` 处计算的指数平滑移动平均值与 `t-1` 处的最大值。'
---

## exponentialTimeDecayedMax {#exponentialtimedecayedmax}

返回在时间索引 `t` 处计算的指数平滑移动平均值与 `t-1` 处的最大值。

**语法**

```sql
exponentialTimeDecayedMax(x)(value, timeunit)
```

**参数**

- `value` — 值。 [整数](../../../sql-reference/data-types/int-uint.md)、[浮点数](../../../sql-reference/data-types/float.md)或[小数](../../../sql-reference/data-types/decimal.md)。
- `timeunit` — 时间单位。 [整数](../../../sql-reference/data-types/int-uint.md)、[浮点数](../../../sql-reference/data-types/float.md)或[小数](../../../sql-reference/data-types/decimal.md)、[日期时间](../../data-types/datetime.md)、[日期时间64](../../data-types/datetime64.md)。

**参数**

- `x` — 半衰期。 [整数](../../../sql-reference/data-types/int-uint.md)、[浮点数](../../../sql-reference/data-types/float.md)或[小数](../../../sql-reference/data-types/decimal.md)。

**返回值**

- 返回在 `t` 和 `t-1` 处的指数平滑加权移动平均值的最大值。 [Float64](../../data-types/float.md)。

**示例**

查询:

```sql
SELECT
    value,
    time,
    round(exp_smooth, 3),
    bar(exp_smooth, 0, 5, 50) AS bar
FROM
    (
    SELECT
    (number = 0) OR (number >= 25) AS value,
    number AS time,
    exponentialTimeDecayedMax(10)(value, time) OVER (ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS exp_smooth
    FROM numbers(50)
    );
```

结果:

```response
    ┌─value─┬─time─┬─round(exp_smooth, 3)─┬─bar────────┐
 1. │     1 │    0 │                    1 │ ██████████ │
 2. │     0 │    1 │                0.905 │ █████████  │
 3. │     0 │    2 │                0.819 │ ████████▏  │
 4. │     0 │    3 │                0.741 │ ███████▍   │
 5. │     0 │    4 │                 0.67 │ ██████▋    │
 6. │     0 │    5 │                0.607 │ ██████     │
 7. │     0 │    6 │                0.549 │ █████▍     │
 8. │     0 │    7 │                0.497 │ ████▉      │
 9. │     0 │    8 │                0.449 │ ████▍      │
10. │     0 │    9 │                0.407 │ ████       │
11. │     0 │   10 │                0.368 │ ███▋       │
12. │     0 │   11 │                0.333 │ ███▎       │
13. │     0 │   12 │                0.301 │ ███        │
14. │     0 │   13 │                0.273 │ ██▋        │
15. │     0 │   14 │                0.247 │ ██▍        │
16. │     0 │   15 │                0.223 │ ██▏        │
17. │     0 │   16 │                0.202 │ ██         │
18. │     0 │   17 │                0.183 │ █▊         │
19. │     0 │   18 │                0.165 │ █▋         │
20. │     0 │   19 │                 0.15 │ █▍         │
21. │     0 │   20 │                0.135 │ █▎         │
22. │     0 │   21 │                0.122 │ █▏         │
23. │     0 │   22 │                0.111 │ █          │
24. │     0 │   23 │                  0.1 │ █          │
25. │     0 │   24 │                0.091 │ ▉          │
26. │     1 │   25 │                    1 │ ██████████ │
27. │     1 │   26 │                    1 │ ██████████ │
28. │     1 │   27 │                    1 │ ██████████ │
29. │     1 │   28 │                    1 │ ██████████ │
30. │     1 │   29 │                    1 │ ██████████ │
31. │     1 │   30 │                    1 │ ██████████ │
32. │     1 │   31 │                    1 │ ██████████ │
33. │     1 │   32 │                    1 │ ██████████ │
34. │     1 │   33 │                    1 │ ██████████ │
35. │     1 │   34 │                    1 │ ██████████ │
36. │     1 │   35 │                    1 │ ██████████ │
37. │     1 │   36 │                    1 │ ██████████ │
38. │     1 │   37 │                    1 │ ██████████ │
39. │     1 │   38 │                    1 │ ██████████ │
40. │     1 │   39 │                    1 │ ██████████ │
41. │     1 │   40 │                    1 │ ██████████ │
42. │     1 │   41 │                    1 │ ██████████ │
43. │     1 │   42 │                    1 │ ██████████ │
44. │     1 │   43 │                    1 │ ██████████ │
45. │     1 │   44 │                    1 │ ██████████ │
46. │     1 │   45 │                    1 │ ██████████ │
47. │     1 │   46 │                    1 │ ██████████ │
48. │     1 │   47 │                    1 │ ██████████ │
49. │     1 │   48 │                    1 │ ██████████ │
50. │     1 │   49 │                    1 │ ██████████ │
    └───────┴──────┴──────────────────────┴────────────┘
```
