---
description: 'quantiles, quantilesExactExclusive, quantilesExactInclusive, quantilesGK'
sidebar_position: 177
slug: /sql-reference/aggregate-functions/reference/quantiles
title: 'Функции quantiles'
doc_type: 'reference'
---



# Функции квантилей



## quantiles {#quantiles}

Синтаксис: `quantiles(level1, level2, ...)(x)`

Для всех функций квантилей существуют соответствующие функции quantiles: `quantiles`, `quantilesDeterministic`, `quantilesTiming`, `quantilesTimingWeighted`, `quantilesExact`, `quantilesExactWeighted`, `quantileExactWeightedInterpolated`, `quantileInterpolatedWeighted`, `quantilesTDigest`, `quantilesBFloat16`, `quantilesDD`. Эти функции вычисляют все квантили для указанных уровней за один проход и возвращают массив полученных значений.


## quantilesExactExclusive {#quantilesexactexclusive}

Точно вычисляет [квантили](https://en.wikipedia.org/wiki/Quantile) числовой последовательности данных.

Для получения точного значения все переданные значения объединяются в массив, который затем частично сортируется. Таким образом, функция потребляет `O(n)` памяти, где `n` — количество переданных значений. Однако при небольшом количестве значений функция работает очень эффективно.

Эта функция эквивалентна функции Excel [PERCENTILE.EXC](https://support.microsoft.com/en-us/office/percentile-exc-function-bbaa7204-e9e1-4010-85bf-c31dc5dce4ba) ([тип R6](https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample)).

Работает эффективнее с наборами уровней, чем [quantileExactExclusive](../../../sql-reference/aggregate-functions/reference/quantileexact.md#quantileexactexclusive).

**Синтаксис**

```sql
quantilesExactExclusive(level1, level2, ...)(expr)
```

**Аргументы**

- `expr` — выражение над значениями столбца, возвращающее числовые [типы данных](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) или [DateTime](../../../sql-reference/data-types/datetime.md).

**Параметры**

- `level` — уровни квантилей. Возможные значения: (0, 1) — границы не включаются. [Float](../../../sql-reference/data-types/float.md).

**Возвращаемое значение**

- [Массив](../../../sql-reference/data-types/array.md) квантилей указанных уровней.

Тип значений массива:

- [Float64](../../../sql-reference/data-types/float.md) для входных данных числового типа.
- [Date](../../../sql-reference/data-types/date.md), если входные значения имеют тип `Date`.
- [DateTime](../../../sql-reference/data-types/datetime.md), если входные значения имеют тип `DateTime`.

**Пример**

Запрос:

```sql
CREATE TABLE num AS numbers(1000);

SELECT quantilesExactExclusive(0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 0.999)(x) FROM (SELECT number AS x FROM num);
```

Результат:

```text
┌─quantilesExactExclusive(0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 0.999)(x)─┐
│ [249.25,499.5,749.75,899.9,949.9499999999999,989.99,998.999]        │
└─────────────────────────────────────────────────────────────────────┘
```


## quantilesExactInclusive {#quantilesexactinclusive}

Точно вычисляет [квантили](https://en.wikipedia.org/wiki/Quantile) числовой последовательности данных.

Для получения точного значения все переданные значения объединяются в массив, который затем частично сортируется. Таким образом, функция потребляет `O(n)` памяти, где `n` — количество переданных значений. Однако при небольшом количестве значений функция работает очень эффективно.

Эта функция эквивалентна функции Excel [PERCENTILE.INC](https://support.microsoft.com/en-us/office/percentile-inc-function-680f9539-45eb-410b-9a5e-c1355e5fe2ed) ([тип R7](https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample)).

Работает эффективнее с наборами уровней, чем [quantileExactInclusive](../../../sql-reference/aggregate-functions/reference/quantileexact.md#quantileexactinclusive).

**Синтаксис**

```sql
quantilesExactInclusive(level1, level2, ...)(expr)
```

**Аргументы**

- `expr` — выражение над значениями столбца, возвращающее числовые [типы данных](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) или [DateTime](../../../sql-reference/data-types/datetime.md).

**Параметры**

- `level` — уровни квантилей. Возможные значения: [0, 1] — границы включены. [Float](../../../sql-reference/data-types/float.md).

**Возвращаемое значение**

- [Массив](../../../sql-reference/data-types/array.md) квантилей указанных уровней.

Тип значений массива:

- [Float64](../../../sql-reference/data-types/float.md) для входных данных числового типа.
- [Date](../../../sql-reference/data-types/date.md), если входные значения имеют тип `Date`.
- [DateTime](../../../sql-reference/data-types/datetime.md), если входные значения имеют тип `DateTime`.

**Пример**

Запрос:

```sql
CREATE TABLE num AS numbers(1000);

SELECT quantilesExactInclusive(0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 0.999)(x) FROM (SELECT number AS x FROM num);
```

Результат:

```text
┌─quantilesExactInclusive(0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 0.999)(x)─┐
│ [249.75,499.5,749.25,899.1,949.05,989.01,998.001]                   │
└─────────────────────────────────────────────────────────────────────┘
```


## quantilesGK {#quantilesgk}

`quantilesGK` работает аналогично `quantileGK`, но позволяет одновременно вычислять квантили на разных уровнях и возвращает массив.

**Синтаксис**

```sql
quantilesGK(accuracy, level1, level2, ...)(expr)
```

**Возвращаемое значение**

- [Массив](../../../sql-reference/data-types/array.md) квантилей указанных уровней.

Тип значений массива:

- [Float64](../../../sql-reference/data-types/float.md) для числовых типов данных.
- [Date](../../../sql-reference/data-types/date.md), если входные значения имеют тип `Date`.
- [DateTime](../../../sql-reference/data-types/datetime.md), если входные значения имеют тип `DateTime`.

**Пример**

Запрос:

```sql
SELECT quantilesGK(1, 0.25, 0.5, 0.75)(number + 1)
FROM numbers(1000)

┌─quantilesGK(1, 0.25, 0.5, 0.75)(plus(number, 1))─┐
│ [1,1,1]                                          │
└──────────────────────────────────────────────────┘

SELECT quantilesGK(10, 0.25, 0.5, 0.75)(number + 1)
FROM numbers(1000)

┌─quantilesGK(10, 0.25, 0.5, 0.75)(plus(number, 1))─┐
│ [156,413,659]                                     │
└───────────────────────────────────────────────────┘
SELECT quantilesGK(100, 0.25, 0.5, 0.75)(number + 1)
FROM numbers(1000)

┌─quantilesGK(100, 0.25, 0.5, 0.75)(plus(number, 1))─┐
│ [251,498,741]                                      │
└────────────────────────────────────────────────────┘

SELECT quantilesGK(1000, 0.25, 0.5, 0.75)(number + 1)
FROM numbers(1000)

┌─quantilesGK(1000, 0.25, 0.5, 0.75)(plus(number, 1))─┐
│ [249,499,749]                                       │
└─────────────────────────────────────────────────────┘
```
