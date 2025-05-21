---
'description': 'Computes the sum of the numbers, using the same data type for the
  result as for the input parameters. If the sum exceeds the maximum value for this
  data type, it is calculated with overflow.'
'sidebar_position': 200
'slug': '/sql-reference/aggregate-functions/reference/sumwithoverflow'
'title': 'sumWithOverflow'
---




# sumWithOverflow

计算数字的总和，结果的数据类型与输入参数相同。如果总和超出了该数据类型的最大值，将使用溢出计算。

仅适用于数字。

**语法**

```sql
sumWithOverflow(num)
```

**参数**
- `num`: 数值列。[(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md)。

**返回值**

- 值的总和。[(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md)。

**示例**

首先我们创建一个 `employees` 表，并插入一些虚构的员工数据。在这个例子中，我们将选择 `salary` 为 `UInt16`，以便这些值的总和可能产生溢出。

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

我们使用 `sum` 和 `sumWithOverflow` 函数查询员工工资的总金额，并使用 `toTypeName` 函数显示它们的类型。
对于 `sum` 函数，结果类型是 `UInt64`，足以容纳总和，而对于 `sumWithOverflow`，结果类型保持为 `UInt16`。

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
