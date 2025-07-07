---
description: 'Агрегатная функция, которая вычисляет максимум среди группы значений.'
sidebar_position: 162
slug: /sql-reference/aggregate-functions/reference/max
title: 'max'
---

Агрегатная функция, которая вычисляет максимум среди группы значений.

Пример:

```sql
SELECT max(salary) FROM employees;
```

```sql
SELECT department, max(salary) FROM employees GROUP BY department;
```

Если вам нужна неагрегатная функция для выбора максимума из двух значений, смотрите `greatest`:

```sql
SELECT greatest(a, b) FROM table;
```
