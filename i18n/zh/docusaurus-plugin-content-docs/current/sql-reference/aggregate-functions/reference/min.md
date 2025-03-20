---
slug: /sql-reference/aggregate-functions/reference/min
sidebar_position: 168
title: 'min'
description: '聚合函数，用于计算一组值中的最小值。'
---

聚合函数，用于计算一组值中的最小值。

示例：

```sql
SELECT min(salary) FROM employees;
```

```sql
SELECT department, min(salary) FROM employees GROUP BY department;
```

如果您需要一个非聚合函数来选择两个值中的最小值，请参见 `least`：

```sql
SELECT least(a, b) FROM table;
```
