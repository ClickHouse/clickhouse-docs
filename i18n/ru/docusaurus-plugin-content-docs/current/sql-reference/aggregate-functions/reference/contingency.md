---
description: 'Функция `contingency` вычисляет коэффициент контингенции — величину, характеризующую степень связи между двумя столбцами таблицы. Вычисление аналогично функции `cramersV`, но с другим знаменателем под знаком квадратного корня.'
sidebar_position: 116
slug: /sql-reference/aggregate-functions/reference/contingency
title: 'contingency'
doc_type: 'reference'
---

# contingency

Функция `contingency` вычисляет [коэффициент контингенции](https://en.wikipedia.org/wiki/Contingency_table#Cram%C3%A9r's_V_and_the_contingency_coefficient_C) — величину, характеризующую степень связи между двумя столбцами в таблице. Расчёт выполняется аналогично [функции `cramersV`](./cramersv.md), но с другим знаменателем под квадратным корнем.

**Синтаксис**

```sql
contingency(column1, column2)
```

**Аргументы**

* `column1` и `column2` — столбцы, которые сравниваются

**Возвращаемое значение**

* значение от 0 до 1. Чем выше результат, тем сильнее связь между двумя столбцами.

**Тип возвращаемого значения** — всегда [Float64](../../../sql-reference/data-types/float.md).

**Пример**

Два столбца, сравниваемые ниже, слабо связаны друг с другом. Мы также включили результат `cramersV` (для сравнения):

```sql
SELECT
    cramersV(a, b),
    contingency(a ,b)
FROM
    (
        SELECT
            number % 10 AS a,
            number % 4 AS b
        FROM
            numbers(150)
    );
```

Результат:

```response
┌─────cramersV(a, b)─┬──contingency(a, b)─┐
│ 0.5798088336225178 │ 0.0817230766271248 │
└────────────────────┴────────────────────┘
```
