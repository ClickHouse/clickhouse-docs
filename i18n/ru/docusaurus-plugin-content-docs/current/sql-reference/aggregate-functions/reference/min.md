---
slug: /sql-reference/aggregate-functions/reference/min
sidebar_position: 168
title: 'min'
description: 'Агрегатная функция, которая вычисляет минимум среди группы значений.'
---

Агрегатная функция, которая вычисляет минимум среди группы значений.

Пример:

```sql
SELECT min(salary) FROM employees;
```

```sql
SELECT department, min(salary) FROM employees GROUP BY department;
```

Если вам нужна неагрегатная функция для выбора минимума между двумя значениями, смотрите `least`:

```sql
SELECT least(a, b) FROM table;
```
