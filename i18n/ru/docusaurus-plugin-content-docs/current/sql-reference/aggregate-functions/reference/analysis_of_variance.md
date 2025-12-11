---
description: 'Предоставляет статистический критерий для однофакторного дисперсионного анализа (ANOVA). Это критерий для нескольких групп нормально распределённых наблюдений, позволяющий проверить, совпадают ли средние значения во всех группах.'
sidebar_position: 101
slug: /sql-reference/aggregate-functions/reference/analysis_of_variance
title: 'analysisOfVariance'
doc_type: 'reference'
---

# analysisOfVariance {#analysisofvariance}

Выполняет статистический тест однофакторного дисперсионного анализа (ANOVA). Это тест для нескольких групп нормально распределённых наблюдений, который позволяет определить, одинаковы ли средние значения во всех группах или нет.

**Синтаксис**

```sql
analysisOfVariance(val, group_no)
```

Псевдонимы: `anova`

**Параметры**

* `val`: значение.
* `group_no` : номер группы, к которой принадлежит `val`.

:::note
Группы нумеруются начиная с 0, и для выполнения теста необходимо как минимум две группы.
Должна быть как минимум одна группа, в которой число наблюдений больше одного.
:::

**Возвращаемое значение**

* `(f_statistic, p_value)`. [Tuple](../../data-types/tuple.md)([Float64](../../data-types/float.md), [Float64](../../data-types/float.md)).

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
