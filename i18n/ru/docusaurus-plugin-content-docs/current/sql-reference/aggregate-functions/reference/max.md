---
description: 'Агрегатная функция, вычисляющая максимальное значение по группе значений.'
sidebar_position: 162
slug: /sql-reference/aggregate-functions/reference/max
title: 'max'
doc_type: 'reference'
---

Агрегатная функция, вычисляющая максимальное значение по группе значений.

Пример:

```sql
SELECT max(salary) FROM employees;
```

```sql
SELECT department, max(salary) FROM employees GROUP BY department;
```

Если вам нужна неагрегатная функция для выбора максимального значения из двух, см. `greatest`:

```sql
SELECT greatest(a, b) FROM table;
```
