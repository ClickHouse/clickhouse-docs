---
slug: /sql-reference/aggregate-functions/reference/theilsu
sidebar_position: 201
title: 'theilsU'
description: 'The `theilsU` function calculates the Theil''s U uncertainty coefficient, a value that measures the association between two columns in a table.'
---


# theilsU

The `theilsU` function calculates the [Theil's U uncertainty coefficient](https://en.wikipedia.org/wiki/Contingency_table#Uncertainty_coefficient)，一个测量表中两列之间关联性的值。它的值范围从 -1.0（100% 负关联，或完美反转）到 +1.0（100% 正关联，或完美协议）。值为 0.0 表示不存在关联。

**语法**

``` sql
theilsU(column1, column2)
```

**参数**

- `column1` 和 `column2` 是要比较的列。

**返回值**

- 一个介于 -1 和 1 之间的值。

**返回类型** 始终是 [Float64](../../../sql-reference/data-types/float.md)。

**示例**

下面比较的两列之间的关联性较小，因此 `theilsU` 的值为负：

``` sql
SELECT
    theilsU(a ,b)
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
┌────────theilsU(a, b)─┐
│ -0.30195720557678846 │
└──────────────────────┘
```
