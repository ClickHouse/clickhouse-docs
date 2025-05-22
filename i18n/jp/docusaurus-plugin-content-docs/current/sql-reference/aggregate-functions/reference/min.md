---
'description': 'Aggregate function that calculates the minimum across a group of values.'
'sidebar_position': 168
'slug': '/sql-reference/aggregate-functions/reference/min'
'title': 'min'
---



集約関数で、値のグループの中で最小値を計算します。

例:

```sql
SELECT min(salary) FROM employees;
```

```sql
SELECT department, min(salary) FROM employees GROUP BY department;
```

2つの値の最小値を選択する非集約関数が必要な場合は、`least` を参照してください:

```sql
SELECT least(a, b) FROM table;
```
