---
description: 'Документация по битовым функциям'
sidebar_label: 'Битовые функции'
sidebar_position: 25
slug: /sql-reference/functions/bitmap-functions
title: 'Битовые функции'
---


# Битовые функции

Битовые карты могут быть созданы двумя способами. Первый способ — это конструкция с помощью функции агрегации groupBitmap с `-State`, второй способ — создать битовую карту из объекта массива.

## bitmapBuild {#bitmapbuild}

Создает битовую карту из массива беззнаковых целых чисел.

**Синтаксис**

```sql
bitmapBuild(array)
```

**Аргументы**

- `array` – Массив беззнаковых целых чисел.

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

Конвертирует битовую карту в массив целых чисел.

**Синтаксис**

```sql
bitmapToArray(bitmap)
```

**Аргументы**

- `bitmap` – Объект битовой карты.

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

Возвращает подмножество битовой карты с битами в пределах интервала значений.

**Синтаксис**

```sql
bitmapSubsetInRange(bitmap, range_start, range_end)
```

**Аргументы**

- `bitmap` – [Объект битовой карты](#bitmapbuild).
- `range_start` – Начало диапазона (включительно). [UInt32](../data-types/int-uint.md).
- `range_end` – Конец диапазона (исключительно). [UInt32](../data-types/int-uint.md).

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

Возвращает подмножество битовой карты с наименьшим значением бита `range_start` и не более `cardinality_limit` элементов.

**Синтаксис**

```sql
bitmapSubsetLimit(bitmap, range_start, cardinality_limit)
```

**Аргументы**

- `bitmap` – [Объект битовой карты](#bitmapbuild).
- `range_start` – Начало диапазона (включительно). [UInt32](../data-types/int-uint.md).
- `cardinality_limit` – Максимальная кардинальность подмножества. [UInt32](../data-types/int-uint.md).

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

Возвращает подмножество битовой карты, начиная с позиции `offset`. Максимальная кардинальность возвращаемой битовой карты — `cardinality_limit`.

**Синтаксис**

```sql
subBitmap(bitmap, offset, cardinality_limit)
```

**Аргументы**

- `bitmap` – Битовоя карта. [Объект битовой карты](#bitmapbuild).
- `offset` – Позиция первого элемента подмножества. [UInt32](../data-types/int-uint.md).
- `cardinality_limit` – Максимальное количество элементов в подмножестве. [UInt32](../data-types/int-uint.md).

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

Проверяет, содержит ли битовая карта элемент.

```sql
bitmapContains(bitmap, needle)
```

**Аргументы**

- `bitmap` – [Объект битовой карты](#bitmapbuild).
- `needle` – Искомое значение бита. [UInt32](../data-types/int-uint.md).

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

Проверяет, пересекаются ли две битовые карты.

Если `bitmap2` содержит ровно один элемент, рассмотрите возможность использования [bitmapContains](#bitmapcontains), так как она работает более эффективно.

**Синтаксис**

```sql
bitmapHasAny(bitmap1, bitmap2)
```

**Аргументы**

- `bitmap1` – Объект битовой карты 1.
- `bitmap2` – Объект битовой карты 2.

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

Возвращает 1, если первая битовая карта содержит все элементы второй битовой карты, в противном случае 0. Если вторая битовая карта пуста, возвращает 1.

Также смотрите `hasAll(array, array)`.

**Синтаксис**

```sql
bitmapHasAll(bitmap1, bitmap2)
```

**Аргументы**

- `bitmap1` – Объект битовой карты 1.
- `bitmap2` – Объект битовой карты 2.

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

Возвращает кардинальность битовой карты.

**Синтаксис**

```sql
bitmapCardinality(bitmap)
```

**Аргументы**

- `bitmap` – Объект битовой карты.

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

Вычисляет наименьший установленный бит в битовой карте или UINT32_MAX, если битовая карта пуста (UINT64_MAX, если тип >= 8 бит).

**Синтаксис**

```sql 
bitmapMin(bitmap)
```

**Аргументы**

- `bitmap` – Объект битовой карты.

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

Вычисляет наибольший установленный бит в битовой карте или 0, если битовая карта пуста.

**Синтаксис**

```sql 
bitmapMax(bitmap)
```

**Аргументы**

- `bitmap` – Объект битовой карты.

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

Заменяет не более N бит в битовой карте. Старое и новое значение i-го замененного бита задаются `from_array[i]` и `to_array[i]`.

Результат зависит от порядка элементов в массивах `from_array` и `to_array`.

**Синтаксис**

```sql
bitmapTransform(bitmap, from_array, to_array)
```

**Аргументы**

- `bitmap` – Объект битовой карты.
- `from_array` – Массив UInt32. Для idx в диапазоне \[0, from_array.size()), если битовая карта содержит from_array\[idx\], то замените его на to_array\[idx\].
- `to_array` – Массив UInt32 того же размера, что и `from_array`.

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

Вычисляет логическое И двух битовых карт.

**Синтаксис**

```sql
bitmapAnd(bitmap,bitmap)
```

**Аргументы**

- `bitmap` – Объект битовой карты.

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

Вычисляет логическое ИЛИ двух битовых карт.

**Синтаксис**

```sql
bitmapOr(bitmap,bitmap)
```

**Аргументы**

- `bitmap` – Объект битовой карты.

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

Вычисляет XOR двух битовых карт.

**Синтаксис**

```sql
bitmapXor(bitmap,bitmap)
```

**Аргументы**

- `bitmap` – Объект битовой карты.

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

Вычисляет логическое И двух битовых карт и инвертирует результат.

**Синтаксис**

```sql
bitmapAndnot(bitmap,bitmap)
```

**Аргументы**

- `bitmap` – Объект битовой карты.

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

Возвращает кардинальность логического И двух битовых карт.

**Синтаксис**

```sql
bitmapAndCardinality(bitmap,bitmap)
```

**Аргументы**

- `bitmap` – Объект битовой карты.

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

Возвращает кардинальность логического ИЛИ двух битовых карт.

```sql
bitmapOrCardinality(bitmap,bitmap)
```

**Аргументы**

- `bitmap` – Объект битовой карты.

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

Возвращает кардинальность XOR двух битовых карт.

```sql
bitmapXorCardinality(bitmap,bitmap)
```

**Аргументы**

- `bitmap` – Объект битовой карты.

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

Возвращает кардинальность операции AND-NOT двух битовых карт.

```sql
bitmapAndnotCardinality(bitmap,bitmap)
```

**Аргументы**

- `bitmap` – Объект битовой карты.

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
