---
description: '计算一组数字的总和，结果的数据类型与输入参数相同。如果总和超过该数据类型的最大值，则按该数据类型的溢出语义进行计算。'
sidebar_position: 200
slug: /sql-reference/aggregate-functions/reference/sumwithoverflow
title: 'sumWithOverflow'
doc_type: 'reference'
---

# sumWithOverflow {#sumwithoverflow}

计算数值的总和，结果的数据类型与输入参数相同。如果总和超过该数据类型的最大值，则会发生溢出并按溢出结果计算。

仅适用于数值类型。

**语法**

```sql
sumWithOverflow(num)
```

**参数**

* `num`: 数值列。[(U)Int*](../../data-types/int-uint.md)、[Float*](../../data-types/float.md)、[Decimal*](../../data-types/decimal.md)。

**返回值**

* 所有值的总和。[(U)Int*](../../data-types/int-uint.md)、[Float*](../../data-types/float.md)、[Decimal*](../../data-types/decimal.md)。

**示例**

首先，我们创建一张 `employees` 表，并向其中插入一些虚构的员工数据。在本示例中，我们将 `salary` 定义为 `UInt16`，以便在对这些值求和时可能产生溢出。

查询：

```sql
CREATE TABLE employees
(
    `id` UInt32,
    `name` String,
    `monthly_salary` UInt16
)
ENGINE = Log
```

```sql
SELECT
    sum(monthly_salary) AS no_overflow,
    sumWithOverflow(monthly_salary) AS overflow,
    toTypeName(no_overflow),
    toTypeName(overflow)
FROM employees
```

我们使用 `sum` 和 `sumWithOverflow` 函数来查询员工工资的总额，并使用 `toTypeName` 函数显示其类型。
对于 `sum` 函数，结果类型为 `UInt64`，足够大，可以容纳该总和；而对于 `sumWithOverflow`，结果类型仍然是 `UInt16`。

查询：

```sql
SELECT 
    sum(monthly_salary) AS no_overflow,
    sumWithOverflow(monthly_salary) AS overflow,
    toTypeName(no_overflow),
    toTypeName(overflow),    
FROM employees;
```

结果：

```response
   ┌─no_overflow─┬─overflow─┬─toTypeName(no_overflow)─┬─toTypeName(overflow)─┐
1. │      118700 │    53164 │ UInt64                  │ UInt16               │
   └─────────────┴──────────┴─────────────────────────┴──────────────────────┘
```
