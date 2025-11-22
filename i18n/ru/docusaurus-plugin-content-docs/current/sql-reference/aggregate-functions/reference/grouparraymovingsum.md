---
description: 'Вычисляет скользящую сумму для входных значений.'
sidebar_position: 144
slug: /sql-reference/aggregate-functions/reference/grouparraymovingsum
title: 'groupArrayMovingSum'
doc_type: 'reference'
---

# groupArrayMovingSum

Вычисляет скользящую сумму по входным значениям.

```sql
groupArrayMovingSum(числа_для_суммирования)
groupArrayMovingSum(размер_окна)(числа_для_суммирования)
```

Функция может принимать размер окна в качестве параметра. Если он не указан, функция использует размер окна, равный количеству строк в столбце.

**Аргументы**

* `numbers_for_summing` — [выражение](/sql-reference/syntax#expressions), результатом которого является значение числового типа данных.
* `window_size` — размер окна вычислений.

**Возвращаемые значения**

* Массив того же размера и типа, что и входные данные.

**Пример**

Пример таблицы:

```sql
CREATE TABLE t
(
    `int` UInt8,
    `float` Float32,
    `dec` Decimal32(2)
)
ENGINE = TinyLog
```

```text
┌─int─┬─float─┬──dec─┐
│   1 │   1.1 │ 1.10 │
│   2 │   2.2 │ 2.20 │
│   4 │   4.4 │ 4.40 │
│   7 │  7.77 │ 7.77 │
└─────┴───────┴──────┘
```

Запросы:

```sql
SELECT
    groupArrayMovingSum(int) AS I,
    groupArrayMovingSum(float) AS F,
    groupArrayMovingSum(dec) AS D
FROM t
```

```text
┌─I──────────┬─F───────────────────────────────┬─D──────────────────────┐
│ [1,3,7,14] │ [1.1,3.3000002,7.7000003,15.47] │ [1.10,3.30,7.70,15.47] │
└────────────┴─────────────────────────────────┴────────────────────────┘
```

```sql
SELECT
    groupArrayMovingSum(2)(int) AS I,
    groupArrayMovingSum(2)(float) AS F,
    groupArrayMovingSum(2)(dec) AS D
FROM t
```

```text
┌─I──────────┬─F───────────────────────────────┬─D──────────────────────┐
│ [1,3,6,11] │ [1.1,3.3000002,6.6000004,12.17] │ [1.10,3.30,6.60,12.17] │
└────────────┴─────────────────────────────────┴────────────────────────┘
```
