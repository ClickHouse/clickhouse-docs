---
description: '値のグループに対して最大値を求める集約関数。'
sidebar_position: 162
slug: /sql-reference/aggregate-functions/reference/max
title: 'max'
doc_type: 'reference'
---

値のグループに対して最大値を求める集約関数。

例:

```sql
SELECT max(salary) FROM employees;
```

```sql
SELECT department, max(salary) FROM employees GROUP BY department;
```

非集約関数で 2 つの値の最大値を取得する必要がある場合は、`greatest` を参照してください。

```sql
SELECT greatest(a, b) FROM table;
```
