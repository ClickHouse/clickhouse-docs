---
description: '値の集合における最小値を計算する集約関数。'
sidebar_position: 168
slug: /sql-reference/aggregate-functions/reference/min
title: 'min'
doc_type: 'reference'
---

値の集合における最小値を計算する集約関数。

例:

```sql
SELECT min(salary) FROM employees;
```

```sql
SELECT department, min(salary) FROM employees GROUP BY department;
```

2 つの値のうち小さい方を選ぶ非集約関数が必要な場合は、`least` を参照してください。

```sql
SELECT least(a, b) FROM table;
```
