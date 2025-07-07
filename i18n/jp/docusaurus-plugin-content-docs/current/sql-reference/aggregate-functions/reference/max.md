---
'description': 'Aggregate function that calculates the maximum across a group of values.'
'sidebar_position': 162
'slug': '/sql-reference/aggregate-functions/reference/max'
'title': 'max'
---



値のグループ間で最大値を計算する集約関数です。

例:

```sql
SELECT max(salary) FROM employees;
```

```sql
SELECT department, max(salary) FROM employees GROUP BY department;
```

2つの値の最大値を選択する非集約関数が必要な場合は、`greatest`を参照してください:

```sql
SELECT greatest(a, b) FROM table;
```
