---
description: 'Агрегатная функция, которая вычисляет минимум среди группы значений.'
sidebar_position: 168
slug: /sql-reference/aggregate-functions/reference/min
title: 'min'
---

Агрегатная функция, которая вычисляет минимум среди группы значений.

Пример:

```sql
SELECT min(salary) FROM employees;
```

```sql
SELECT department, min(salary) FROM employees GROUP BY department;
```

Если вам нужна неагрегатная функция для выбора минимума из двух значений, смотрите `least`:

```sql
SELECT least(a, b) FROM table;
```
