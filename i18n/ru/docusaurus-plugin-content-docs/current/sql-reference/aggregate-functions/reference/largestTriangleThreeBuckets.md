---
slug: '/sql-reference/aggregate-functions/reference/largestTriangleThreeBuckets'
sidebar_label: largestTriangleThreeBuckets
sidebar_position: 159
description: 'Применяет алгоритм Largest-Triangle-Three-Buckets к входным данным.'
title: largestTriangleThreeBuckets
doc_type: reference
---
# largestTriangleThreeBuckets

Применяет алгоритм [Largest-Triangle-Three-Buckets](https://skemman.is/bitstream/1946/15343/3/SS_MSthesis.pdf) к входным данным. 
Алгоритм используется для даунсемплинга данных временных рядов для визуализации. Он разработан для работы с отсортированными по x координате рядами. 
Алгоритм разбивает отсортированный ряд на бакеты и находит самый большой треугольник в каждом бакете. Количество бакетов равно количеству точек в результирующем ряде. 
Функция сначала отсортирует данные по `x`, а затем применит алгоритм даунсемплинга к отсортированным данным.

**Синтаксис**

```sql
largestTriangleThreeBuckets(n)(x, y)
```

Псевдоним: `lttb`.

**Аргументы**

- `x` — x координата. [Целое число](../../../sql-reference/data-types/int-uint.md), [Вещественное число](../../../sql-reference/data-types/float.md), [Десятичное число](../../../sql-reference/data-types/decimal.md), [Дата](../../../sql-reference/data-types/date.md), [Date32](../../../sql-reference/data-types/date32.md), [Дата/Время](../../../sql-reference/data-types/datetime.md), [DateTime64](../../../sql-reference/data-types/datetime64.md).
- `y` — y координата. [Целое число](../../../sql-reference/data-types/int-uint.md), [Вещественное число](../../../sql-reference/data-types/float.md), [Десятичное число](../../../sql-reference/data-types/decimal.md), [Дата](../../../sql-reference/data-types/date.md), [Date32](../../../sql-reference/data-types/date32.md), [Дата/Время](../../../sql-reference/data-types/datetime.md), [DateTime64](../../../sql-reference/data-types/datetime64.md).

NaN значения игнорируются в предоставленном ряду, что означает, что любые значения NaN будут исключены из анализа. Это гарантирует, что функция работает только с корректными числовыми данными.

**Параметры**

- `n` — количество точек в результирующем ряде. [UInt64](../../../sql-reference/data-types/int-uint.md).

**Возвращаемые значения**

[Массив](../../../sql-reference/data-types/array.md) [Кортежей](../../../sql-reference/data-types/tuple.md) с двумя элементами:

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