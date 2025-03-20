---
slug: /sql-reference/aggregate-functions/reference/sum
sidebar_position: 195
title: 'sum'
description: '计算总和。仅适用于数字。'
---


# sum

计算总和。仅适用于数字。

**语法**

```sql
sum(num)
```

**参数**
- `num`: 数值列。[(U)Int*](../../data-types/int-uint.md)，[Float*](../../data-types/float.md)，[Decimal*](../../data-types/decimal.md)。

**返回值**

- 值的总和。[(U)Int*](../../data-types/int-uint.md)，[Float*](../../data-types/float.md)，[Decimal*](../../data-types/decimal.md)。

**示例**

首先创建一个表 `employees` 并插入一些虚构的员工数据。

查询：

```sql
CREATE TABLE employees
(
    `id` UInt32,
    `name` String,
    `salary` UInt32
)
ENGINE = Log
```

```sql
INSERT INTO employees VALUES
    (87432, 'John Smith', 45680),
    (59018, 'Jane Smith', 72350),
    (20376, 'Ivan Ivanovich', 58900),
    (71245, 'Anastasia Ivanovna', 89210);
```

我们使用 `sum` 函数查询员工工资的总额。

查询：

```sql
SELECT sum(salary) FROM employees;
```

结果：

```response
   ┌─sum(salary)─┐
1. │      266140 │
   └─────────────┘
```
