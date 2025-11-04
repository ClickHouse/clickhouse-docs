---
slug: '/sql-reference/aggregate-functions/reference/theilsu'
sidebar_position: 201
description: "Функция `theilsU` рассчитывает коэффициент неопределенности Theils'"
title: theilsU
doc_type: reference
---
# theilsU

Функция `theilsU` вычисляет [коэффициент неопределенности Тейла](https://en.wikipedia.org/wiki/Contingency_table#Uncertainty_coefficient), значение, которое измеряет связь между двумя колонками в таблице. Его значения варьируются от −1.0 (100% отрицательная ассоциация или идеальное инвертирование) до +1.0 (100% положительная ассоциация или идеальное согласие). Значение 0.0 указывает на отсутствие ассоциации.

**Синтаксис**

```sql
theilsU(column1, column2)
```

**Аргументы**

- `column1` и `column2` — это колонки, которые будут сравнены

**Возвращаемое значение**

- значение в диапазоне от -1 до 1

**Тип возвращаемого значения** всегда [Float64](../../../sql-reference/data-types/float.md).

**Пример**

Ниже приведенные две колонки, которые сравниваются, имеют небольшую ассоциацию друг с другом, поэтому значение `theilsU` отрицательное:

```sql
SELECT
    theilsU(a ,b)
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
┌────────theilsU(a, b)─┐
│ -0.30195720557678846 │
└──────────────────────┘
```