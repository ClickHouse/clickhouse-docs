---
description: 'Функция `contingency` вычисляет коэффициент контингенции — величину, измеряющую степень связи между двумя столбцами таблицы. Вычисление аналогично функции `cramersV`, но с другим знаменателем под квадратным корнем.'
sidebar_position: 116
slug: /sql-reference/aggregate-functions/reference/contingency
title: 'contingency'
doc_type: 'reference'
---

# contingency {#contingency}

Функция `contingency` вычисляет [коэффициент контингенции](https://en.wikipedia.org/wiki/Contingency_table#Cram%C3%A9r's_V_and_the_contingency_coefficient_C) — величину, которая измеряет связь между двумя столбцами в таблице. Вычисление аналогично [функции `cramersV`](./cramersv.md), но отличается знаменателем под знаком квадратного корня.

**Синтаксис**

```sql
contingency(column1, column2)
```

**Аргументы**

* `column1` и `column2` — столбцы, которые нужно сравнить

**Возвращаемое значение**

* значение между 0 и 1. Чем больше результат, тем сильнее связь между двумя столбцами.

**Тип возвращаемого значения** всегда [Float64](../../../sql-reference/data-types/float.md).

**Пример**

Два столбца, сравниваемые ниже, имеют слабую связь друг с другом. Мы также включили результат функции `cramersV` (для сравнения):

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
