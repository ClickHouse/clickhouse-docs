---
'description': '聚合函数，用于计算一组值中的最小值。'
'sidebar_position': 168
'slug': '/sql-reference/aggregate-functions/reference/min'
'title': 'min'
'doc_type': 'reference'
---

计算一组值中的最小值的聚合函数。

示例：

```sql
SELECT min(salary) FROM employees;
```

```sql
SELECT department, min(salary) FROM employees GROUP BY department;
```

如果您需要非聚合函数来选择两个值中的最小值，请参阅 `least`：

```sql
SELECT least(a, b) FROM table;
```
