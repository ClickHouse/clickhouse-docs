---
description: '计算一组值中最小值的聚合函数。'
sidebar_position: 168
slug: /sql-reference/aggregate-functions/reference/min
title: 'min'
doc_type: 'reference'
---

计算一组值中最小值的聚合函数。

示例：

```sql
SELECT min(salary) FROM employees;
```

```sql
SELECT department, min(salary) FROM employees GROUP BY department;
```

如果你需要使用非聚合函数在两个值中选取较小值，请参阅 `least`：

```sql
SELECT least(a, b) FROM table;
```
