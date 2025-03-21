---
slug: /sql-reference/aggregate-functions/reference/contingency
sidebar_position: 116
title: 'contingency'
description: 'The `contingency` function calculates the contingency coefficient, a value that measures the association between two columns in a table. The computation is similar to the `cramersV` function but with a different denominator in the square root.'
---


# contingency

The `contingency` function calculates the [contingency coefficient](https://en.wikipedia.org/wiki/Contingency_table#Cram%C3%A9r's_V_and_the_contingency_coefficient_C), a value that measures the association between two columns in a table. The computation is similar to [the `cramersV` function](./cramersv.md) but with a different denominator in the square root.

**语法**

``` sql
contingency(column1, column2)
```

**参数**

- `column1` 和 `column2` 是要进行比较的列

**返回值**

- 一个介于 0 和 1 之间的值。结果越大，两个列之间的关联越紧密。

**返回类型** 始终是 [Float64](../../../sql-reference/data-types/float.md)。

**示例**

下面比较的两个列之间的关联性较小。我们还包括了 `cramersV` 的结果（作为比较）：

``` sql
SELECT
    cramersV(a, b),
    contingency(a ,b)
FROM
    (
        SELECT
            number % 10 AS a,
            number % 4 AS b
        FROM
            numbers(150)
    );
```

结果：

```response
┌──────cramersV(a, b)─┬───contingency(a, b)─┐
│ 0.41171788506213564 │ 0.05812725261759165 │
└─────────────────────┴─────────────────────┘
```
