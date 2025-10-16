---
slug: '/sql-reference/aggregate-functions/reference/analysis_of_variance'
sidebar_position: 101
description: 'Представляет статистический тест для однофакторного анализа дисперсии'
title: analysisOfVariance
doc_type: reference
---
# анализДисперсии

Предоставляет статистический тест для одномерного анализа дисперсии (тест ANOVA). Это тест для нескольких групп нормально распределенных наблюдений, чтобы выяснить, имеют ли все группы одинаковое среднее значение или нет. 

**Синтаксис**

```sql
analysisOfVariance(val, group_no)
```

Псевдонимы: `anova`

**Параметры**
- `val`: значение. 
- `group_no`: номер группы, к которой принадлежит `val`.

:::note
Группы нумеруются начиная с 0, и должно быть как минимум две группы для проведения теста.
Должна быть хотя бы одна группа с количеством наблюдений больше одного.
:::

**Возвращаемое значение**

- `(f_statistic, p_value)`. [Кортеж](../../data-types/tuple.md)([Float64](../../data-types/float.md), [Float64](../../data-types/float.md)).

**Пример**

Запрос:

```sql
SELECT analysisOfVariance(number, number % 2) FROM numbers(1048575);
```

Результат:

```response
┌─analysisOfVariance(number, modulo(number, 2))─┐
│ (0,1)                                         │
└───────────────────────────────────────────────┘
```