---
description: 'Вычисляет приблизительное количество различных значений аргумента. То же,
  что uniqCombined, но использует 64-битный хеш для всех типов данных, а не только
  для типа String.'
sidebar_position: 206
slug: /sql-reference/aggregate-functions/reference/uniqcombined64
title: 'uniqCombined64'
doc_type: 'reference'
---

# uniqCombined64 {#uniqcombined64}

Вычисляет приблизительное количество различных значений аргумента. Аналогична функции [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined), но использует 64-битный хеш для всех типов данных, а не только для строкового типа данных String.

```sql
uniqCombined64(HLL_precision)(x[, ...])
```

**Параметры**

* `HLL_precision`: двоичный логарифм числа ячеек в [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog). Также вы можете использовать функцию как `uniqCombined64(x[, ...])`. Значение по умолчанию для `HLL_precision` — 17, что фактически соответствует 96 КиБ памяти (2^17 ячеек по 6 бит каждая).
* `X`: Переменное количество параметров. Параметры могут иметь типы `Tuple`, `Array`, `Date`, `DateTime`, `String` или быть числовыми.

**Возвращаемое значение**

* Число типа [UInt64](../../../sql-reference/data-types/int-uint.md).

**Подробности реализации**

Функция `uniqCombined64`:

* Вычисляет хеш (64-битный хеш для всех типов данных) для всех параметров в агрегате и затем использует его в вычислениях.
* Использует комбинацию трёх алгоритмов: массив, хеш-таблица и HyperLogLog с таблицей коррекции погрешности.
  * Для небольшого количества различных элементов используется массив.
  * При увеличении размера множества используется хеш-таблица.
  * Для большого количества элементов используется HyperLogLog, который занимает фиксированный объём памяти.
* Возвращает результат детерминированно (он не зависит от порядка обработки запроса).

:::note
Поскольку для всех типов используется 64-битный хеш, результат не страдает от очень высокой погрешности для кардинальностей, значительно превышающих `UINT_MAX`, в отличие от [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md), который использует 32-битный хеш для типов, отличных от `String`.
:::

По сравнению с функцией [uniq](/sql-reference/aggregate-functions/reference/uniq) функция `uniqCombined64`:

* Потребляет в несколько раз меньше памяти.
* Вычисляет результат с в несколько раз более высокой точностью.

**Пример**

В примере ниже `uniqCombined64` применяется к `1e10` различным числам и возвращает очень близкую оценку количества различных значений аргумента.

Запрос:

```sql
SELECT uniqCombined64(number) FROM numbers(1e10);
```

Результат:

```response
┌─uniqCombined64(number)─┐
│             9998568925 │ -- 10.00 billion
└────────────────────────┘
```

Для сравнения функция `uniqCombined` возвращает довольно неточное приближение для такого объёма входных данных.

Запрос:

```sql
SELECT uniqCombined(number) FROM numbers(1e10);
```

Результат:

```response
┌─uniqCombined(number)─┐
│           5545308725 │ -- 5.55 billion
└──────────────────────┘
```

**См. также**

* [uniq](/sql-reference/aggregate-functions/reference/uniq)
* [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
* [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
* [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
* [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
