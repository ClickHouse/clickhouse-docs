---
description: 'Функция `contingency` вычисляет коэффициент контингенции, значение, которое измеряет связь между двумя столбцами в таблице. Вычисление похоже на функцию `cramersV`, но с другим знаменателем под квадратным корнем.'
sidebar_position: 116
slug: /sql-reference/aggregate-functions/reference/contingency
title: 'contingency'
---


# contingency

Функция `contingency` вычисляет [коэффициент контингенции](https://en.wikipedia.org/wiki/Contingency_table#Cram%C3%A9r's_V_and_the_contingency_coefficient_C), значение, которое измеряет связь между двумя столбцами в таблице. Вычисление похоже на [функцию `cramersV`](./cramersv.md), но с другим знаменателем под квадратным корнем.

**Синтаксис**

```sql
contingency(column1, column2)
```

**Аргументы**

- `column1` и `column2` — это столбцы, которые будут сравниваться

**Возвращаемое значение**

- значение между 0 и 1. Чем больше результат, тем ближе связь между двумя столбцами.

**Тип возвращаемого значения** всегда [Float64](../../../sql-reference/data-types/float.md).

**Пример**

Два столбца, которые сравниваются ниже, имеют небольшую связь между собой. Мы также включили результат `cramersV` (для сравнения):

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
┌──────cramersV(a, b)─┬───contingency(a, b)─┐
│ 0.41171788506213564 │ 0.05812725261759165 │
└─────────────────────┴─────────────────────┘
```
