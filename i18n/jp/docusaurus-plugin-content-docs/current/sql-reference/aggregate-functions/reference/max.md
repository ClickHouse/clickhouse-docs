---
'description': '値のグループにわたって最大値を計算する集約関数。'
'sidebar_position': 162
'slug': '/sql-reference/aggregate-functions/reference/max'
'title': 'max'
'doc_type': 'reference'
---

値のグループの中で最大値を計算する集約関数です。

例:

```sql
SELECT max(salary) FROM employees;
```

```sql
SELECT department, max(salary) FROM employees GROUP BY department;
```

2つの値の最大値を選択するための非集約関数が必要な場合は、`greatest`をご覧ください：

```sql
SELECT greatest(a, b) FROM table;
```
