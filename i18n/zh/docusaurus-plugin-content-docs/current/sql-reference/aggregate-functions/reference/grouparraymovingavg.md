---
'description': '计算输入值的移动平均。'
'sidebar_position': 144
'slug': '/sql-reference/aggregate-functions/reference/grouparraymovingavg'
'title': 'groupArrayMovingAvg'
'doc_type': 'reference'
---


# groupArrayMovingAvg

计算输入值的移动平均值。

```sql
groupArrayMovingAvg(numbers_for_summing)
groupArrayMovingAvg(window_size)(numbers_for_summing)
```

该函数可以将窗口大小作为参数。如果未指定，则函数将窗口大小设为列中的行数。

**参数**

- `numbers_for_summing` — [表达式](/sql-reference/syntax#expressions)，结果为数值数据类型。
- `window_size` — 计算窗口的大小。

**返回值**

- 与输入数据相同大小和类型的数组。

该函数使用 [向零取整](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero)。它会截断与结果数据类型不相关的小数位。

**示例**

示例表 `b`：

```sql
CREATE TABLE t
(
    `int` UInt8,
    `float` Float32,
    `dec` Decimal32(2)
)
ENGINE = TinyLog
```

```text
┌─int─┬─float─┬──dec─┐
│   1 │   1.1 │ 1.10 │
│   2 │   2.2 │ 2.20 │
│   4 │   4.4 │ 4.40 │
│   7 │  7.77 │ 7.77 │
└─────┴───────┴──────┘
```

查询：

```sql
SELECT
    groupArrayMovingAvg(int) AS I,
    groupArrayMovingAvg(float) AS F,
    groupArrayMovingAvg(dec) AS D
FROM t
```

```text
┌─I─────────┬─F───────────────────────────────────┬─D─────────────────────┐
│ [0,0,1,3] │ [0.275,0.82500005,1.9250001,3.8675] │ [0.27,0.82,1.92,3.86] │
└───────────┴─────────────────────────────────────┴───────────────────────┘
```

```sql
SELECT
    groupArrayMovingAvg(2)(int) AS I,
    groupArrayMovingAvg(2)(float) AS F,
    groupArrayMovingAvg(2)(dec) AS D
FROM t
```

```text
┌─I─────────┬─F────────────────────────────────┬─D─────────────────────┐
│ [0,1,3,5] │ [0.55,1.6500001,3.3000002,6.085] │ [0.55,1.65,3.30,6.08] │
└───────────┴──────────────────────────────────┴───────────────────────┘
```
