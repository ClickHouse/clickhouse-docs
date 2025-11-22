---
description: '`contingency` 函数计算列联系数，这是一种用于衡量表中两列之间关联程度的数值。其计算方式与 `cramersV` 函数类似，但平方根内所用的分母不同。'
sidebar_position: 116
slug: /sql-reference/aggregate-functions/reference/contingency
title: 'contingency'
doc_type: 'reference'
---

# contingency

函数 `contingency` 计算[列联系数（contingency coefficient）](https://en.wikipedia.org/wiki/Contingency_table#Cram%C3%A9r's_V_and_the_contingency_coefficient_C)，该值用于衡量表中两列之间的关联程度。其计算方式与[`cramersV` 函数](./cramersv.md)类似，但在平方根中使用了不同的分母。

**语法**

```sql
contingency(column1, column2)
```

**参数**

* `column1` 和 `column2` 是要比较的列

**返回值**

* 一个介于 0 和 1 之间的值。结果越大，两列之间的关联越紧密。

**返回类型** 始终为 [Float64](../../../sql-reference/data-types/float.md)。

**示例**

下面要比较的两列之间的关联性较弱。我们还包含了 `cramersV` 的结果（作为对比）：

```sql
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
┌─────cramersV(a, b)─┬──contingency(a, b)─┐
│ 0.5798088336225178 │ 0.0817230766271248 │
└────────────────────┴────────────────────┘
```
