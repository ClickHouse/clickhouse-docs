---
description: 'Применяет алгоритм Largest-Triangle-Three-Buckets к входным данным.'
sidebar_label: 'largestTriangleThreeBuckets'
sidebar_position: 159
slug: /sql-reference/aggregate-functions/reference/largestTriangleThreeBuckets
title: 'largestTriangleThreeBuckets'
---


# largestTriangleThreeBuckets

Применяет алгоритм [Largest-Triangle-Three-Buckets](https://skemman.is/bitstream/1946/15343/3/SS_MSthesis.pdf) к входным данным. 
Алгоритм используется для уменьшения объема данных временных рядов для визуализации. Он предназначен для работы с рядами, отсортированными по координате x.
Алгоритм делит отсортированный ряд на части и находит самый большой треугольник в каждой части. Количество частей равно количеству точек в результирующем ряде. 
Функция отсортирует данные по `x`, а затем применит алгоритм уменьшения объема данных к отсортированным данным.

**Синтаксис**

```sql
largestTriangleThreeBuckets(n)(x, y)
```

Псевдоним: `lttb`.

**Аргументы**

- `x` — координата x. [Целое](../../../sql-reference/data-types/int-uint.md), [Вещественное](../../../sql-reference/data-types/float.md), [Десятичное](../../../sql-reference/data-types/decimal.md), [Дата](../../../sql-reference/data-types/date.md), [Date32](../../../sql-reference/data-types/date32.md), [Дата и время](../../../sql-reference/data-types/datetime.md), [Дата и время с точностью до наносекунд](../../../sql-reference/data-types/datetime64.md).
- `y` — координата y. [Целое](../../../sql-reference/data-types/int-uint.md), [Вещественное](../../../sql-reference/data-types/float.md), [Десятичное](../../../sql-reference/data-types/decimal.md), [Дата](../../../sql-reference/data-types/date.md), [Date32](../../../sql-reference/data-types/date32.md), [Дата и время](../../../sql-reference/data-types/datetime.md), [Дата и время с точностью до наносекунд](../../../sql-reference/data-types/datetime64.md).

NaN значения игнорируются в предоставленной серии, что означает, что любые значения NaN будут исключены из анализа. Это гарантирует, что функция работает только с корректными числовыми данными.

**Параметры**

- `n` — количество точек в результующем ряде. [UInt64](../../../sql-reference/data-types/int-uint.md).

**Возвращаемые значения**

[Массив](../../../sql-reference/data-types/array.md) из [Кортеж](../../../sql-reference/data-types/tuple.md) с двумя элементами:

**Пример**

Входная таблица:

```text
┌─────x───────┬───────y──────┐
│ 1.000000000 │ 10.000000000 │
│ 2.000000000 │ 20.000000000 │
│ 3.000000000 │ 15.000000000 │
│ 8.000000000 │ 60.000000000 │
│ 9.000000000 │ 55.000000000 │
│ 10.00000000 │ 70.000000000 │
│ 4.000000000 │ 30.000000000 │
│ 5.000000000 │ 40.000000000 │
│ 6.000000000 │ 35.000000000 │
│ 7.000000000 │ 50.000000000 │
└─────────────┴──────────────┘
```

Запрос:

```sql
SELECT largestTriangleThreeBuckets(4)(x, y) FROM largestTriangleThreeBuckets_test;
```

Результат:

```text
┌────────largestTriangleThreeBuckets(4)(x, y)───────────┐
│           [(1,10),(3,15),(9,55),(10,70)]              │
└───────────────────────────────────────────────────────┘
```
