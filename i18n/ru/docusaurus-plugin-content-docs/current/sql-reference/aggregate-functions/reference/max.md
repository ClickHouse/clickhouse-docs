---
slug: /sql-reference/aggregate-functions/reference/max
sidebar_position: 162
title: 'max'
description: 'Агрегатная функция, которая вычисляет максимум по группе значений.'
---

Агрегатная функция, которая вычисляет максимум по группе значений.

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
