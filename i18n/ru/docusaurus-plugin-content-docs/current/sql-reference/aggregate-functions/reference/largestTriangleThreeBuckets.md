---
slug: /sql-reference/aggregate-functions/reference/largestTriangleThreeBuckets
sidebar_position: 159
sidebar_label: largestTriangleThreeBuckets
title: 'largestTriangleThreeBuckets'
description: 'Применяет алгоритм Largest-Triangle-Three-Buckets к входным данным.'
---


# largestTriangleThreeBuckets

Применяет [алгоритм Largest-Triangle-Three-Buckets](https://skemman.is/bitstream/1946/15343/3/SS_MSthesis.pdf) к входным данным.  
Алгоритм используется для понижения дискретизации временных рядов для визуализации. Он предназначен для работы с рядами, отсортированными по координате x.  
Он работает путем деления отсортированного ряда на баки и затем нахождения наибольшего треугольника в каждом баке. Количество баков равно количеству точек в результирующем ряду.  
Функция отсортирует данные по `x`, а затем применит алгоритм понижения дискретизации к отсортированным данным.

**Синтаксис**

``` sql
largestTriangleThreeBuckets(n)(x, y)
```

Псевдоним: `lttb`.

**Аргументы**

- `x` — координата x. [Целое](../../../sql-reference/data-types/int-uint.md), [Число с плавающей точкой](../../../sql-reference/data-types/float.md), [Десятичное](../../../sql-reference/data-types/decimal.md), [Дата](../../../sql-reference/data-types/date.md), [Дата32](../../../sql-reference/data-types/date32.md), [Дата и время](../../../sql-reference/data-types/datetime.md), [Дата и время64](../../../sql-reference/data-types/datetime64.md).
- `y` — координата y. [Целое](../../../sql-reference/data-types/int-uint.md), [Число с плавающей точкой](../../../sql-reference/data-types/float.md), [Десятичное](../../../sql-reference/data-types/decimal.md), [Дата](../../../sql-reference/data-types/date.md), [Дата32](../../../sql-reference/data-types/date32.md), [Дата и время](../../../sql-reference/data-types/datetime.md), [Дата и время64](../../../sql-reference/data-types/datetime64.md).

Значения NaN игнорируются в предоставленном ряде, что означает, что любые значения NaN будут исключены из анализа. Это гарантирует, что функция работает только с допустимыми числовыми данными.

**Параметры**

- `n` — количество точек в результирующем ряду. [UInt64](../../../sql-reference/data-types/int-uint.md).

**Возвращаемые значения**

[Массив](../../../sql-reference/data-types/array.md) [Кортежей](../../../sql-reference/data-types/tuple.md) с двумя элементами:

**Пример**

Входная таблица:

``` text
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

``` sql
SELECT largestTriangleThreeBuckets(4)(x, y) FROM largestTriangleThreeBuckets_test;
```

Результат:

``` text
┌────────largestTriangleThreeBuckets(4)(x, y)───────────┐
│           [(1,10),(3,15),(9,55),(10,70)]              │
└───────────────────────────────────────────────────────┘
```
