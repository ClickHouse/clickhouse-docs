---
slug: /sql-reference/aggregate-functions/reference/max
sidebar_position: 162
title: 'max'
description: '聚合函数，用于计算一组值中的最大值。'
---

聚合函数，用于计算一组值中的最大值。

示例：

```sql
SELECT max(salary) FROM employees;
```

```sql
SELECT department, max(salary) FROM employees GROUP BY department;
```

如果您需要非聚合函数来选择两个值中的最大值，请参见 `greatest`：

```sql
SELECT greatest(a, b) FROM table;
```
