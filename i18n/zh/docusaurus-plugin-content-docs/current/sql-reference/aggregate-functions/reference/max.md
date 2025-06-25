---
'description': '聚合函数，用于计算一组值中的最大值。'
'sidebar_position': 162
'slug': '/sql-reference/aggregate-functions/reference/max'
'title': 'max'
---

聚合函数，用于计算一组值中的最大值。

示例：

```sql
SELECT max(salary) FROM employees;
```

```sql
SELECT department, max(salary) FROM employees GROUP BY department;
```

如果您需要选择两个值中的最大值的非聚合函数，请参见 `greatest`：

```sql
SELECT greatest(a, b) FROM table;
```
