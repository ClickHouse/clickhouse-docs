---
description: 'Применяет алгоритм Largest-Triangle-Three-Buckets к входным данным.'
sidebar_label: 'largestTriangleThreeBuckets'
sidebar_position: 159
slug: /sql-reference/aggregate-functions/reference/largestTriangleThreeBuckets
title: 'largestTriangleThreeBuckets'
---


# largestTriangleThreeBuckets

Применяет алгоритм [Largest-Triangle-Three-Buckets](https://skemman.is/bitstream/1946/15343/3/SS_MSthesis.pdf) к входным данным.  
Алгоритм используется для уменьшения количества данных временных рядов для визуализации. Он разработан для работы с сериями, отсортированными по координате x.  
Он работает, деля отсортированную серию на ведра, а затем находя самый большой треугольник в каждом ведре. Количество ведер равно количеству точек в результирующей серии.  
Функция отсортирует данные по `x`, а затем применит алгоритм уменьшения данных к отсортированным данным.

**Синтаксис**

```sql
largestTriangleThreeBuckets(n)(x, y)
```

Псевдоним: `lttb`.

**Аргументы**

- `x` — координата x. [Целое](../../../sql-reference/data-types/int-uint.md) , [Вещественное](../../../sql-reference/data-types/float.md) , [Десятичное](../../../sql-reference/data-types/decimal.md)  , [Дата](../../../sql-reference/data-types/date.md), [Date32](../../../sql-reference/data-types/date32.md), [ДатаВремя](../../../sql-reference/data-types/datetime.md), [ДатаВремя64](../../../sql-reference/data-types/datetime64.md).
- `y` — координата y. [Целое](../../../sql-reference/data-types/int-uint.md) , [Вещественное](../../../sql-reference/data-types/float.md) , [Десятичное](../../../sql-reference/data-types/decimal.md)  , [Дата](../../../sql-reference/data-types/date.md), [Date32](../../../sql-reference/data-types/date32.md), [ДатаВремя](../../../sql-reference/data-types/datetime.md), [ДатаВремя64](../../../sql-reference/data-types/datetime64.md).

NaNs игнорируются в предоставленной серии, что означает, что любые значения NaN будут исключены из анализа. Это обеспечивает работу функции только с допустимыми числовыми данными.

**Параметры**

- `n` — количество точек в результующей серии. [UInt64](../../../sql-reference/data-types/int-uint.md).

**Возвращаемые значения**

[Массив](../../../sql-reference/data-types/array.md) из [Кортежа](../../../sql-reference/data-types/tuple.md) с двумя элементами:

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
