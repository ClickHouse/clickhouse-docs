---
'description': '集団の値の中で最小値を計算する集約関数。'
'sidebar_position': 168
'slug': '/sql-reference/aggregate-functions/reference/min'
'title': '最小値'
'doc_type': 'reference'
---

集約関数は、一連の値の中で最小値を計算します。

例:

```sql
SELECT min(salary) FROM employees;
```

```sql
SELECT department, min(salary) FROM employees GROUP BY department;
```

2つの値の最小値を選択する非集約関数が必要な場合は、`least`を参照してください:

```sql
SELECT least(a, b) FROM table;
```
