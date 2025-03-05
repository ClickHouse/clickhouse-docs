---
slug: /sql-reference/aggregate-functions/reference/min
sidebar_position: 168
title: min
description: "グループ内の値の最小値を計算する集約関数。"
---

グループ内の値の最小値を計算する集約関数。

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
