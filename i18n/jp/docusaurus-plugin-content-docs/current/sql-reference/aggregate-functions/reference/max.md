---
slug: /sql-reference/aggregate-functions/reference/max
sidebar_position: 162
title: max
description: "値のグループ内で最大値を計算する集約関数。"
---

値のグループ内で最大値を計算する集約関数。

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
