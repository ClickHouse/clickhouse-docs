---
description: 'Агрегатная функция, вычисляющая минимальное значение в группе значений.'
sidebar_position: 168
slug: /sql-reference/aggregate-functions/reference/min
title: 'min'
doc_type: 'reference'
---

Агрегатная функция, вычисляющая минимальное значение в группе значений.

Пример:

```sql
SELECT min(salary) FROM employees;
```

```sql
SELECT department, min(salary) FROM employees GROUP BY department;
```

Если вам нужна не агрегатная функция для выбора минимального из двух значений, см. `least`:

```sql
SELECT least(a, b) FROM table;
```
