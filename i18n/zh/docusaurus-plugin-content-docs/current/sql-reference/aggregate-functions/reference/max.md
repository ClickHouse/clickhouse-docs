---
description: '用于计算一组值中最大值的聚合函数。'
sidebar_position: 162
slug: /sql-reference/aggregate-functions/reference/max
title: 'max'
doc_type: 'reference'
---

用于计算一组值中最大值的聚合函数。

示例：

```sql
SELECT max(salary) FROM employees;
```

```sql
SELECT department, max(salary) FROM employees GROUP BY department;
```

如果需要使用非聚合函数在两个值中取最大值，请参阅 `greatest`：

```sql
SELECT greatest(a, b) FROM table;
```
