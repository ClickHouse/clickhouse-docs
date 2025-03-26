---
description: 'Документация по функциям битмапа'
sidebar_label: 'Битмап'
sidebar_position: 25
slug: /sql-reference/functions/bitmap-functions
title: 'Функции битмапа'
---


# Функции битмапа

Битмапы могут быть созданы двумя способами. Первый способ - это использование агрегатной функции groupBitmap с `-State`, другой способ - создать битмап из объекта массива.

## bitmapBuild {#bitmapbuild}

Создает битмап из массива беззнаковых целых чисел.

**Синтаксис**

```sql
bitmapBuild(array)
```

**Аргументы**

- `array` – массив беззнаковых целых чисел.

**Пример**

```sql
SELECT bitmapBuild([1, 2, 3, 4, 5]) AS res, toTypeName(res);
```

```text
┌─res─┬─toTypeName(bitmapBuild([1, 2, 3, 4, 5]))─────┐
│     │ AggregateFunction(groupBitmap, UInt8)        │
└─────┴──────────────────────────────────────────────┘
```

## bitmapToArray {#bitmaptoarray}

Преобразует битмап в массив целых чисел.

**Синтаксис**

```sql
bitmapToArray(bitmap)
```

**Аргументы**

- `bitmap` – объект битмапа.

**Пример**

```sql
SELECT bitmapToArray(bitmapBuild([1, 2, 3, 4, 5])) AS res;
```

Результат:

```text
┌─res─────────┐
│ [1,2,3,4,5] │
└─────────────┘
```

## bitmapSubsetInRange {#bitmapsubsetinrange}

Возвращает подмножество битмапа с битами в пределах заданного интервала значений.

**Синтаксис**

```sql
bitmapSubsetInRange(bitmap, range_start, range_end)
```

**Аргументы**

- `bitmap` – [объект битмапа](#bitmapbuild).
- `range_start` – начало диапазона (включительно). [UInt32](../data-types/int-uint.md).
- `range_end` – конец диапазона (исключительно). [UInt32](../data-types/int-uint.md).

**Пример**

```sql
SELECT bitmapToArray(bitmapSubsetInRange(bitmapBuild([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,100,200,500]), toUInt32(30), toUInt32(200))) AS res;
```

Результат:

```text
┌─res───────────────┐
│ [30,31,32,33,100] │
└───────────────────┘
```

## bitmapSubsetLimit {#bitmapsubsetlimit}

Возвращает подмножество битмапа с наименьшим значением бита `range_start` и не более `cardinality_limit` элементов.

**Синтаксис**

```sql
bitmapSubsetLimit(bitmap, range_start, cardinality_limit)
```

**Аргументы**

- `bitmap` – [объект битмапа](#bitmapbuild).
- `range_start` – начало диапазона (включительно). [UInt32](../data-types/int-uint.md).
- `cardinality_limit` – максимальная кардинальность подмножества. [UInt32](../data-types/int-uint.md).

**Пример**

```sql
SELECT bitmapToArray(bitmapSubsetLimit(bitmapBuild([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,100,200,500]), toUInt32(30), toUInt32(200))) AS res;
```

Результат:

```text
┌─res───────────────────────┐
│ [30,31,32,33,100,200,500] │
└───────────────────────────┘
```

## subBitmap {#subbitmap}

Возвращает подмножество битмапа, начиная с позиции `offset`. Максимальная кардинальность возвращенного битмапа составляет `cardinality_limit`.

**Синтаксис**

```sql
subBitmap(bitmap, offset, cardinality_limit)
```

**Аргументы**

- `bitmap` – битмап. [объект битмапа](#bitmapbuild).
- `offset` – позиция первого элемента подмножества. [UInt32](../data-types/int-uint.md).
- `cardinality_limit` – максимальное количество элементов в подмножестве. [UInt32](../data-types/int-uint.md).

**Пример**

```sql
SELECT bitmapToArray(subBitmap(bitmapBuild([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,100,200,500]), toUInt32(10), toUInt32(10))) AS res;
```

Результат:

```text
┌─res─────────────────────────────┐
│ [10,11,12,13,14,15,16,17,18,19] │
└─────────────────────────────────┘
```

## bitmapContains {#bitmapcontains}

Проверяет, содержит ли битмап элемент.

```sql
bitmapContains(bitmap, needle)
```

**Аргументы**

- `bitmap` – [объект битмапа](#bitmapbuild).
- `needle` – искомое значение бита. [UInt32](../data-types/int-uint.md).

**Возвращаемые значения**

- 0 — Если `bitmap` не содержит `needle`. [UInt8](../data-types/int-uint.md).
- 1 — Если `bitmap` содержит `needle`. [UInt8](../data-types/int-uint.md).

**Пример**

```sql
SELECT bitmapContains(bitmapBuild([1,5,7,9]), toUInt32(9)) AS res;
```

Результат:

```text
┌─res─┐
│  1  │
└─────┘
```

## bitmapHasAny {#bitmaphasany}

Проверяет, пересекаются ли два битмапа.

Если `bitmap2` содержит ровно один элемент, рассмотрите возможность использования [bitmapContains](#bitmapcontains) вместо этого, так как это работает более эффективно.

**Синтаксис**

```sql
bitmapHasAny(bitmap1, bitmap2)
```

**Аргументы**

- `bitmap1` – объект битмапа 1.
- `bitmap2` – объект битмапа 2.

**Возвращаемые значения**

- `1`, если `bitmap1` и `bitmap2` имеют хотя бы один общий элемент.
- `0`, в противном случае.

**Пример**

```sql
SELECT bitmapHasAny(bitmapBuild([1,2,3]),bitmapBuild([3,4,5])) AS res;
```

Результат:

```text
┌─res─┐
│  1  │
└─────┘
```

## bitmapHasAll {#bitmaphasall}

Возвращает 1, если первый битмап содержит все элементы второго битмапа, иначе 0. Если второй битмап пуст, возвращает 1.

См. также `hasAll(array, array)`.

**Синтаксис**

```sql
bitmapHasAll(bitmap1, bitmap2)
```

**Аргументы**

- `bitmap1` – объект битмапа 1.
- `bitmap2` – объект битмапа 2.

**Пример**

```sql
SELECT bitmapHasAll(bitmapBuild([1,2,3]),bitmapBuild([3,4,5])) AS res;
```

Результат:

```text
┌─res─┐
│  0  │
└─────┘
```

## bitmapCardinality {#bitmapcardinality}

Возвращает кардинальность битмапа.

**Синтаксис**

```sql
bitmapCardinality(bitmap)
```

**Аргументы**

- `bitmap` – объект битмапа.

**Пример**

```sql
SELECT bitmapCardinality(bitmapBuild([1, 2, 3, 4, 5])) AS res;
```

Результат:

```text
┌─res─┐
│   5 │
└─────┘
```

## bitmapMin {#bitmapmin}

Вычисляет наименьший установленный бит в битмапе, или UINT32_MAX, если битмап пуст.

**Синтаксис**

```sql 
bitmapMin(bitmap)
```

**Аргументы**

- `bitmap` – объект битмапа.

**Пример**

```sql
SELECT bitmapMin(bitmapBuild([1, 2, 3, 4, 5])) AS res;
```

Результат:

```text
 ┌─res─┐
 │   1 │
 └─────┘
```

## bitmapMax {#bitmapmax}

Вычисляет наибольший установленный бит в битмапе, или 0, если битмап пуст.

**Синтаксис**

```sql 
bitmapMax(bitmap)
```

**Аргументы**

- `bitmap` – объект битмапа.

**Пример**

```sql
SELECT bitmapMax(bitmapBuild([1, 2, 3, 4, 5])) AS res;
```

Результат:

```text
 ┌─res─┐
 │   5 │
 └─────┘
```

## bitmapTransform {#bitmaptransform}

Заменяет не более N бит в битмапе. Старое и новое значение i-го замененного бита задаются `from_array[i]` и `to_array[i]`.

Результат зависит от порядка массивов `from_array` и `to_array`.

**Синтаксис**

```sql
bitmapTransform(bitmap, from_array, to_array)
```

**Аргументы**

- `bitmap` – объект битмапа.
- `from_array` – массив UInt32. Для индекса в диапазоне \[0, from_array.size()), если битмап содержит from_array\[idx\], затем замените его на to_array\[idx\].
- `to_array` – массив UInt32 такого же размера, как `from_array`.

**Пример**

```sql
SELECT bitmapToArray(bitmapTransform(bitmapBuild([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]), cast([5,999,2] as Array(UInt32)), cast([2,888,20] as Array(UInt32)))) AS res;
```

Результат:

```text
 ┌─res───────────────────┐
 │ [1,3,4,6,7,8,9,10,20] │
 └───────────────────────┘
```

## bitmapAnd {#bitmapand}

Вычисляет логическое и двух битмапов.

**Синтаксис**

```sql
bitmapAnd(bitmap,bitmap)
```

**Аргументы**

- `bitmap` – объект битмапа.

**Пример**

```sql
SELECT bitmapToArray(bitmapAnd(bitmapBuild([1,2,3]),bitmapBuild([3,4,5]))) AS res;
```

Результат:

```text
┌─res─┐
│ [3] │
└─────┘
```

## bitmapOr {#bitmapor}

Вычисляет логическое или двух битмапов.

**Синтаксис**

```sql
bitmapOr(bitmap,bitmap)
```

**Аргументы**

- `bitmap` – объект битмапа.

**Пример**

```sql
SELECT bitmapToArray(bitmapOr(bitmapBuild([1,2,3]),bitmapBuild([3,4,5]))) AS res;
```

Результат:

```text
┌─res─────────┐
│ [1,2,3,4,5] │
└─────────────┘
```

## bitmapXor {#bitmapxor}

Выполняет операцию XOR для двух битмапов.

**Синтаксис**

```sql
bitmapXor(bitmap,bitmap)
```

**Аргументы**

- `bitmap` – объект битмапа.

**Пример**

```sql
SELECT bitmapToArray(bitmapXor(bitmapBuild([1,2,3]),bitmapBuild([3,4,5]))) AS res;
```

Результат:

```text
┌─res───────┐
│ [1,2,4,5] │
└───────────┘
```

## bitmapAndnot {#bitmapandnot}

Вычисляет логическое и двух битмапов и негативирует результат.

**Синтаксис**

```sql
bitmapAndnot(bitmap,bitmap)
```

**Аргументы**

- `bitmap` – объект битмапа.

**Пример**

```sql
SELECT bitmapToArray(bitmapAndnot(bitmapBuild([1,2,3]),bitmapBuild([3,4,5]))) AS res;
```

Результат:

```text
┌─res───┐
│ [1,2] │
└───────┘
```

## bitmapAndCardinality {#bitmapandcardinality}

Возвращает кардинальность логического и двух битмапов.

**Синтаксис**

```sql
bitmapAndCardinality(bitmap,bitmap)
```

**Аргументы**

- `bitmap` – объект битмапа.

**Пример**

```sql
SELECT bitmapAndCardinality(bitmapBuild([1,2,3]),bitmapBuild([3,4,5])) AS res;
```

Результат:

```text
┌─res─┐
│   1 │
└─────┘
```

## bitmapOrCardinality {#bitmaporcardinality}

Возвращает кардинальность логического или двух битмапов.

```sql
bitmapOrCardinality(bitmap,bitmap)
```

**Аргументы**

- `bitmap` – объект битмапа.

**Пример**

```sql
SELECT bitmapOrCardinality(bitmapBuild([1,2,3]),bitmapBuild([3,4,5])) AS res;
```

Результат:

```text
┌─res─┐
│   5 │
└─────┘
```

## bitmapXorCardinality {#bitmapxorcardinality}

Возвращает кардинальность XOR двух битмапов.

```sql
bitmapXorCardinality(bitmap,bitmap)
```

**Аргументы**

- `bitmap` – объект битмапа.

**Пример**

```sql
SELECT bitmapXorCardinality(bitmapBuild([1,2,3]),bitmapBuild([3,4,5])) AS res;
```

Результат:

```text
┌─res─┐
│   4 │
└─────┘
```

## bitmapAndnotCardinality {#bitmapandnotcardinality}

Возвращает кардинальность операции AND-NOT двух битмапов.

```sql
bitmapAndnotCardinality(bitmap,bitmap)
```

**Аргументы**

- `bitmap` – объект битмапа.

**Пример**

```sql
SELECT bitmapAndnotCardinality(bitmapBuild([1,2,3]),bitmapBuild([3,4,5])) AS res;
```

Результат:

```text
┌─res─┐
│   2 │
└─────┘
```
