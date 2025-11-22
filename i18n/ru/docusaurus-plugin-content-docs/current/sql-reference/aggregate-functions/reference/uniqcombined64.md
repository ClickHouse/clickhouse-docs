---
description: 'Вычисляет приблизительное количество различных значений аргумента. Аналогична uniqCombined, но использует 64-битную хеш-функцию для всех типов данных, а не только для типа данных String.'
sidebar_position: 206
slug: /sql-reference/aggregate-functions/reference/uniqcombined64
title: 'uniqCombined64'
doc_type: 'reference'
---

# uniqCombined64

Вычисляет приблизительное количество различных значений аргументов. То же самое, что и [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined), но использует 64-битный хэш для всех типов данных, а не только для типа данных String.

```sql
uniqCombined64(HLL_precision)(x[, ...])
```

**Параметры**

* `HLL_precision`: двоичный логарифм количества ячеек в [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog). Также функцию можно вызывать как `uniqCombined64(x[, ...])`. Значение по умолчанию для `HLL_precision` — 17, что фактически соответствует 96 КиБ памяти (2^17 ячеек по 6 бит каждая).
* `X`: переменное число параметров. Параметры могут иметь типы `Tuple`, `Array`, `Date`, `DateTime`, `String` или числовые типы.

**Возвращаемое значение**

* Число типа [UInt64](../../../sql-reference/data-types/int-uint.md).

**Подробности реализации**

Функция `uniqCombined64`:

* Вычисляет хэш (64-битный хэш для всех типов данных) для всех параметров в агрегате и затем использует его в вычислениях.
* Использует комбинацию трёх алгоритмов: массив, хеш-таблицу и HyperLogLog с таблицей коррекции ошибок.
  * Для малого числа различных элементов используется массив.
  * При большем размере множества используется хеш-таблица.
  * Для ещё большего числа элементов используется HyperLogLog, который занимает фиксированный объём памяти.
* Возвращает результат детерминированно (он не зависит от порядка обработки запроса).

:::note
Поскольку для всех типов используется 64-битный хэш, результат не страдает от очень высокой погрешности для кардинальностей, значительно превышающих значение `UINT_MAX`, как это происходит у функции [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md), которая использует 32-битный хэш для типов, отличных от `String`.
:::

По сравнению с функцией [uniq](/sql-reference/aggregate-functions/reference/uniq) функция `uniqCombined64`:

* Потребляет в несколько раз меньше памяти.
* Обеспечивает в несколько раз более высокую точность.

**Пример**

В примере ниже `uniqCombined64` применяется к `1e10` различным числам и возвращает очень близкое приближение количества различных значений аргумента.

Запрос:

```sql
SELECT uniqCombined64(number) FROM numbers(1e10);
```

Результат:

```response
┌─uniqCombined64(number)─┐
│             9998568925 │ -- 10,00 миллиардов
└────────────────────────┘
```

Для сравнения функция `uniqCombined` возвращает довольно неточное приближение для таких объёмов входных данных.

Запрос:

```sql
SELECT uniqCombined(number) FROM numbers(1e10);
```

Результат:

```response
┌─uniqCombined(number)─┐
│           5545308725 │ -- 5,55 миллиарда
└──────────────────────┘
```

**См. также**

* [uniq](/sql-reference/aggregate-functions/reference/uniq)
* [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
* [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
* [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
* [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
