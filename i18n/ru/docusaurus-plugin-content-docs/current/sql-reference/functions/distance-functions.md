---
description: 'Документация по функциям расстояний'
sidebar_label: 'Расстояние'
sidebar_position: 55
slug: /sql-reference/functions/distance-functions
title: 'Функции расстояний'
---


# Функции расстояний

## L1Norm {#l1norm}

Вычисляет сумму абсолютных значений вектора.

**Синтаксис**

```sql
L1Norm(vector)
```

Псевдоним: `normL1`.

**Аргументы**

- `vector` — [Кортеж](../data-types/tuple.md) или [Массив](../data-types/array.md).

**Возвращаемое значение**

- L1-норма или расстояние в [таксикобритании](https://en.wikipedia.org/wiki/Taxicab_geometry). [UInt](../data-types/int-uint.md), [Float](../data-types/float.md) или [Decimal](../data-types/decimal.md).

**Примеры**

Запрос:

```sql
SELECT L1Norm((1, 2));
```

Результат:

```text
┌─L1Norm((1, 2))─┐
│              3 │
└────────────────┘
```

## L2Norm {#l2norm}

Вычисляет квадратный корень из суммы квадратов значений вектора.

**Синтаксис**

```sql
L2Norm(vector)
```

Псевдоним: `normL2`.

**Аргументы**

- `vector` — [Кортеж](../data-types/tuple.md) или [Массив](../data-types/array.md).

**Возвращаемое значение**

- L2-норма или [эвклидово расстояние](https://en.wikipedia.org/wiki/Euclidean_distance). [Float](../data-types/float.md).

**Пример**

Запрос:

```sql
SELECT L2Norm((1, 2));
```

Результат:

```text
┌───L2Norm((1, 2))─┐
│ 2.23606797749979 │
└──────────────────┘
```
## L2SquaredNorm {#l2squarednorm}

Вычисляет квадратный корень суммы квадратов значений вектора (квадрат [L2Norm](#l2norm)).

**Синтаксис**

```sql
L2SquaredNorm(vector)
```

Псевдоним: `normL2Squared`.

**Аргументы**

- `vector` — [Кортеж](../data-types/tuple.md) или [Массив](../data-types/array.md).

**Возвращаемое значение**

- Квадрат L2-нормы. [Float](../data-types/float.md).

**Пример**

Запрос:

```sql
SELECT L2SquaredNorm((1, 2));
```

Результат:

```text
┌─L2SquaredNorm((1, 2))─┐
│                     5 │
└───────────────────────┘
```

## LinfNorm {#linfnorm}

Вычисляет максимум абсолютных значений вектора.

**Синтаксис**

```sql
LinfNorm(vector)
```

Псевдоним: `normLinf`.

**Аргументы**

- `vector` — [Кортеж](../data-types/tuple.md) или [Массив](../data-types/array.md).

**Возвращаемое значение**

- Linf-норма или максимальное абсолютное значение. [Float](../data-types/float.md).

**Пример**

Запрос:

```sql
SELECT LinfNorm((1, -2));
```

Результат:

```text
┌─LinfNorm((1, -2))─┐
│                 2 │
└───────────────────┘
```

## LpNorm {#lpnorm}

Вычисляет корень `p`-й степени суммы абсолютных значений вектора в степени `p`.

**Синтаксис**

```sql
LpNorm(vector, p)
```

Псевдоним: `normLp`.

**Аргументы**

- `vector` — [Кортеж](../data-types/tuple.md) или [Массив](../data-types/array.md).
- `p` — Степень. Возможные значения: действительное число в `[1; inf)`. [UInt](../data-types/int-uint.md) или [Float](../data-types/float.md).

**Возвращаемое значение**

- [Lp-норма](https://en.wikipedia.org/wiki/Norm_(mathematics)#p-norm). [Float](../data-types/float.md).

**Пример**

Запрос:

```sql
SELECT LpNorm((1, -2), 2);
```

Результат:

```text
┌─LpNorm((1, -2), 2)─┐
│   2.23606797749979 │
└────────────────────┘
```

## L1Distance {#l1distance}

Вычисляет расстояние между двумя точками (значения векторов являются координатами) в пространстве `L1` (1-норма ([таксикобритания](https://en.wikipedia.org/wiki/Taxicab_geometry) расстояние)).

**Синтаксис**

```sql
L1Distance(vector1, vector2)
```

Псевдоним: `distanceL1`.

**Аргументы**

- `vector1` — Первый вектор. [Кортеж](../data-types/tuple.md) или [Массив](../data-types/array.md).
- `vector2` — Второй вектор. [Кортеж](../data-types/tuple.md) или [Массив](../data-types/array.md).

**Возвращаемое значение**

- 1-нормное расстояние. [Float](../data-types/float.md).

**Пример**

Запрос:

```sql
SELECT L1Distance((1, 2), (2, 3));
```

Результат:

```text
┌─L1Distance((1, 2), (2, 3))─┐
│                          2 │
└────────────────────────────┘
```

## L2Distance {#l2distance}

Вычисляет расстояние между двумя точками (значения векторов являются координатами) в евклидовом пространстве ([эвклидово расстояние](https://en.wikipedia.org/wiki/Euclidean_distance)).

**Синтаксис**

```sql
L2Distance(vector1, vector2)
```

Псевдоним: `distanceL2`.

**Аргументы**

- `vector1` — Первый вектор. [Кортеж](../data-types/tuple.md) или [Массив](../data-types/array.md).
- `vector2` — Второй вектор. [Кортеж](../data-types/tuple.md) или [Массив](../data-types/array.md).

**Возвращаемое значение**

- 2-нормное расстояние. [Float](../data-types/float.md).

**Пример**

Запрос:

```sql
SELECT L2Distance((1, 2), (2, 3));
```

Результат:

```text
┌─L2Distance((1, 2), (2, 3))─┐
│         1.4142135623730951 │
└────────────────────────────┘
```

## L2SquaredDistance {#l2squareddistance}

Вычисляет сумму квадратов разности между соответствующими элементами двух векторов.

**Синтаксис**

```sql
L2SquaredDistance(vector1, vector2)
```

Псевдоним: `distanceL2Squared`.

**Аргументы**

- `vector1` — Первый вектор. [Кортеж](../data-types/tuple.md) или [Массив](../data-types/array.md).
- `vector2` — Второй вектор. [Кортеж](../data-types/tuple.md) или [Массив](../data-types/array.md).

**Возвращаемое значение**

- Сумма квадратов разностей между соответствующими элементами двух векторов. [Float](../data-types/float.md).

**Пример**

Запрос:

```sql
SELECT L2SquaredDistance([1, 2, 3], [0, 0, 0])
```

Результат:

```response
┌─L2SquaredDistance([1, 2, 3], [0, 0, 0])─┐
│                                      14 │
└─────────────────────────────────────────┘
```

## LinfDistance {#linfdistance}

Вычисляет расстояние между двумя точками (значения векторов являются координатами) в пространстве `L_{inf}` ([максимальная норма](https://en.wikipedia.org/wiki/Norm_(mathematics)#Maximum_norm_(special_case_of:_infinity_norm,_uniform_norm,_or_supremum_norm))).

**Синтаксис**

```sql
LinfDistance(vector1, vector2)
```

Псевдоним: `distanceLinf`.

**Аргументы**

- `vector1` — Первый вектор. [Кортеж](../data-types/tuple.md) или [Массив](../data-types/array.md).
- `vector1` — Второй вектор. [Кортеж](../data-types/tuple.md) или [Массив](../data-types/array.md).

**Возвращаемое значение**

- Расстояние по бесконечному норму. [Float](../data-types/float.md).

**Пример**

Запрос:

```sql
SELECT LinfDistance((1, 2), (2, 3));
```

Результат:

```text
┌─LinfDistance((1, 2), (2, 3))─┐
│                            1 │
└──────────────────────────────┘
```

## LpDistance {#lpdistance}

Вычисляет расстояние между двумя точками (значения векторов являются координатами) в пространстве `Lp` ([p-нормное расстояние](https://en.wikipedia.org/wiki/Norm_(mathematics)#p-norm)).

**Синтаксис**

```sql
LpDistance(vector1, vector2, p)
```

Псевдоним: `distanceLp`.

**Аргументы**

- `vector1` — Первый вектор. [Кортеж](../data-types/tuple.md) или [Массив](../data-types/array.md).
- `vector2` — Второй вектор. [Кортеж](../data-types/tuple.md) или [Массив](../data-types/array.md).
- `p` — Степень. Возможные значения: действительное число из `[1; inf)`. [UInt](../data-types/int-uint.md) или [Float](../data-types/float.md).

**Возвращаемое значение**

- p-нормное расстояние. [Float](../data-types/float.md).

**Пример**

Запрос:

```sql
SELECT LpDistance((1, 2), (2, 3), 3);
```

Результат:

```text
┌─LpDistance((1, 2), (2, 3), 3)─┐
│            1.2599210498948732 │
└───────────────────────────────┘
```

## L1Normalize {#l1normalize}

Вычисляет единичный вектор заданного вектора (значения кортежа являются координатами) в пространстве `L1` ([таксикобритания](https://en.wikipedia.org/wiki/Taxicab_geometry)).

**Синтаксис**

```sql
L1Normalize(tuple)
```

Псевдоним: `normalizeL1`.

**Аргументы**

- `tuple` — [Кортеж](../data-types/tuple.md).

**Возвращаемое значение**

- Единичный вектор. [Кортеж](../data-types/tuple.md) из [Float](../data-types/float.md).

**Пример**

Запрос:

```sql
SELECT L1Normalize((1, 2));
```

Результат:

```text
┌─L1Normalize((1, 2))─────────────────────┐
│ (0.3333333333333333,0.6666666666666666) │
└─────────────────────────────────────────┘
```

## L2Normalize {#l2normalize}

Вычисляет единичный вектор заданного вектора (значения кортежа являются координатами) в евклидово пространстве (используя [эвклидово расстояние](https://en.wikipedia.org/wiki/Euclidean_distance)).

**Синтаксис**

```sql
L2Normalize(tuple)
```

Псевдоним: `normalizeL1`.

**Аргументы**

- `tuple` — [Кортеж](../data-types/tuple.md).

**Возвращаемое значение**

- Единичный вектор. [Кортеж](../data-types/tuple.md) из [Float](../data-types/float.md).

**Пример**

Запрос:

```sql
SELECT L2Normalize((3, 4));
```

Результат:

```text
┌─L2Normalize((3, 4))─┐
│ (0.6,0.8)           │
└─────────────────────┘
```

## LinfNormalize {#linfnormalize}

Вычисляет единичный вектор заданного вектора (значения кортежа являются координатами) в пространстве `L_{inf}` (используя [максимальную норму](https://en.wikipedia.org/wiki/Norm_(mathematics)#Maximum_norm_(special_case_of:_infinity_norm,_uniform_norm,_or_supremum_norm))).

**Синтаксис**

```sql
LinfNormalize(tuple)
```

Псевдоним: `normalizeLinf `.

**Аргументы**

- `tuple` — [Кортеж](../data-types/tuple.md).

**Возвращаемое значение**

- Единичный вектор. [Кортеж](../data-types/tuple.md) из [Float](../data-types/float.md).

**Пример**

Запрос:

```sql
SELECT LinfNormalize((3, 4));
```

Результат:

```text
┌─LinfNormalize((3, 4))─┐
│ (0.75,1)              │
└───────────────────────┘
```

## LpNormalize {#lpnormalize}

Вычисляет единичный вектор заданного вектора (значения кортежа являются координатами) в пространстве `Lp` (используя [p-норму](https://en.wikipedia.org/wiki/Norm_(mathematics)#p-norm)).

**Синтаксис**

```sql
LpNormalize(tuple, p)
```

Псевдоним: `normalizeLp `.

**Аргументы**

- `tuple` — [Кортеж](../data-types/tuple.md).
- `p` — Степень. Возможные значения: любое число из [1;inf). [UInt](../data-types/int-uint.md) или [Float](../data-types/float.md).

**Возвращаемое значение**

- Единичный вектор. [Кортеж](../data-types/tuple.md) из [Float](../data-types/float.md).

**Пример**

Запрос:

```sql
SELECT LpNormalize((3, 4),5);
```

Результат:

```text
┌─LpNormalize((3, 4), 5)──────────────────┐
│ (0.7187302630182624,0.9583070173576831) │
└─────────────────────────────────────────┘
```

## cosineDistance {#cosinedistance}

Вычисляет косинусное расстояние между двумя векторами (значения кортежей являются координатами). Чем меньше возвращаемое значение, тем более схожи векторы.

**Синтаксис**

```sql
cosineDistance(vector1, vector2)
```

**Аргументы**

- `vector1` — Первый кортеж. [Кортеж](../data-types/tuple.md) или [Массив](../data-types/array.md).
- `vector2` — Второй кортеж. [Кортеж](../data-types/tuple.md) или [Массив](../data-types/array.md).

**Возвращаемое значение**

- Косинус угла между двумя векторами, вычитание из единицы. [Float](../data-types/float.md).

**Примеры**

Запрос:

```sql
SELECT cosineDistance((1, 2), (2, 3));
```

Результат:

```text
┌─cosineDistance((1, 2), (2, 3))─┐
│           0.007722123286332261 │
└────────────────────────────────┘
```
