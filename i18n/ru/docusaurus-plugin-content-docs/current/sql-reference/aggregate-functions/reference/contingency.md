---
description: 'Функция `contingency` вычисляет коэффициент контингентности, значение, которое измеряет ассоциацию между двумя колонками в таблице. Вычисление похоже на функцию `cramersV`, но с другим знаменателем в квадратном корне.'
sidebar_position: 116
slug: /sql-reference/aggregate-functions/reference/contingency
title: 'contingency'
---


# contingency

Функция `contingency` вычисляет [коэффициент контингентности](https://en.wikipedia.org/wiki/Contingency_table#Cram%C3%A9r's_V_and_the_contingency_coefficient_C), значение, которое измеряет ассоциацию между двумя колонками в таблице. Вычисление похоже на [функцию `cramersV`](./cramersv.md), но с другим знаменателем в квадратном корне.


**Синтаксис**

```sql
contingency(column1, column2)
```

**Аргументы**

- `column1` и `column2` — это колонки, которые необходимо сравнить

**Возвращаемое значение**

- значение между 0 и 1. Чем больше результат, тем ближе ассоциация двух колонок.

**Тип возвращаемого значения** всегда [Float64](../../../sql-reference/data-types/float.md).

**Пример**

Сравниваемые ниже две колонки имеют небольшую ассоциацию друг с другом. Мы также включили результат `cramersV` (для сравнения):

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
