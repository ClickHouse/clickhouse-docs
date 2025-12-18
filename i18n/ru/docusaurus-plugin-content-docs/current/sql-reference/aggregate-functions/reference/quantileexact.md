---
description: 'функции quantileExact, quantileExactLow, quantileExactHigh, quantileExactExclusive,
  quantileExactInclusive'
sidebar_position: 173
slug: /sql-reference/aggregate-functions/reference/quantileexact
title: 'Функции quantileExact'
doc_type: 'reference'
---

# Функции quantileExact {#quantileexact-functions}

## quantileExact {#quantileexact}

Точно вычисляет [квантиль](https://en.wikipedia.org/wiki/Quantile) для числовой последовательности данных.

Чтобы получить точное значение, все переданные значения объединяются в массив, который затем частично сортируется. Поэтому функция потребляет `O(n)` памяти, где `n` — количество переданных значений. Однако для небольшого количества значений функция очень эффективна.

При использовании нескольких функций `quantile*` с разными уровнями в одном запросе их внутренние состояния не объединяются (то есть запрос работает менее эффективно, чем мог бы). В этом случае используйте функцию [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles).

**Синтаксис**

```sql
quantileExact(level)(expr)
```

Псевдоним: `medianExact`.

**Аргументы**

* `level` — уровень квантиля. Необязательный параметр. Константное число с плавающей запятой от 0 до 1. Рекомендуется использовать значение `level` в диапазоне `[0.01, 0.99]`. Значение по умолчанию: 0.5. При `level=0.5` функция вычисляет [медиану](https://en.wikipedia.org/wiki/Median).
* `expr` — выражение над значениями столбца, результатом которого может быть числовой [тип данных](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) или [DateTime](../../../sql-reference/data-types/datetime.md).

**Возвращаемое значение**

* Квантиль указанного уровня.

Тип:

* Для числовых типов данных формат результата будет таким же, как формат входных данных. Например:

```sql

SELECT
    toTypeName(quantileExact(number)) AS `quantile`,
    toTypeName(quantileExact(number::Int32)) AS `quantile_int32`,
    toTypeName(quantileExact(number::Float32)) AS `quantile_float32`,
    toTypeName(quantileExact(number::Float64)) AS `quantile_float64`,
    toTypeName(quantileExact(number::Int64)) AS `quantile_int64`
FROM numbers(1)
   ┌─quantile─┬─quantile_int32─┬─quantile_float32─┬─quantile_float64─┬─quantile_int64─┐
1. │ UInt64   │ Int32          │ Float32          │ Float64          │ Int64          │
   └──────────┴────────────────┴──────────────────┴──────────────────┴────────────────┘

1 row in set. Elapsed: 0.002 sec.
```

* [Date](../../../sql-reference/data-types/date.md), если входные значения имеют тип `Date`.
* [DateTime](../../../sql-reference/data-types/datetime.md), если входные значения имеют тип `DateTime`.

**Пример**

Запрос:

```sql
SELECT quantileExact(number) FROM numbers(10)
```

Результат:

```text
┌─quantileExact(number)─┐
│                     5 │
└───────────────────────┘
```

## quantileExactLow {#quantileexactlow}

Аналогично `quantileExact`, вычисляет точный [квантиль](https://en.wikipedia.org/wiki/Quantile) числовой последовательности данных.

Чтобы получить точное значение, все переданные значения объединяются в массив, который затем полностью сортируется. Сложность [алгоритма сортировки](https://en.cppreference.com/w/cpp/algorithm/sort) составляет `O(N·log(N))`, где `N = std::distance(first, last)` сравнений.

Возвращаемое значение зависит от уровня квантиля и количества элементов в выборке, то есть если уровень равен 0.5, функция возвращает нижнее значение медианы для чётного количества элементов и среднее значение медианы для нечётного количества элементов. Медиана вычисляется аналогично реализации [median&#95;low](https://docs.python.org/3/library/statistics.html#statistics.median_low), используемой в Python.

Для всех остальных уровней возвращается элемент с индексом, соответствующим значению `level * size_of_array`. Например:

```sql
SELECT quantileExactLow(0.1)(number) FROM numbers(10)

┌─quantileExactLow(0.1)(number)─┐
│                             1 │
└───────────────────────────────┘
```

При использовании нескольких функций `quantile*` с разными уровнями в одном запросе внутренние состояния функций не объединяются (то есть запрос работает менее эффективно, чем мог бы). В этом случае используйте функцию [quantiles](/sql-reference/aggregate-functions/reference/quantiles).

**Синтаксис**

```sql
quantileExactLow(level)(expr)
```

Синоним: `medianExactLow`.

**Аргументы**

* `level` — уровень квантиля. Необязательный параметр. Константное число с плавающей запятой от 0 до 1. Рекомендуется использовать значение `level` в диапазоне `[0.01, 0.99]`. Значение по умолчанию: 0.5. При `level=0.5` функция вычисляет [медиану](https://en.wikipedia.org/wiki/Median).
* `expr` — выражение над значениями столбца, результатом которого являются числовые [типы данных](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) или [DateTime](../../../sql-reference/data-types/datetime.md).

**Возвращаемое значение**

* Квантиль указанного уровня.

Тип:

* [Float64](../../../sql-reference/data-types/float.md) для числовых типов данных на входе.
* [Date](../../../sql-reference/data-types/date.md), если входные значения имеют тип `Date`.
* [DateTime](../../../sql-reference/data-types/datetime.md), если входные значения имеют тип `DateTime`.

**Пример**

Запрос:

```sql
SELECT quantileExactLow(number) FROM numbers(10)
```

Результат:

```text
┌─quantileExactLow(number)─┐
│                        4 │
└──────────────────────────┘
```

## quantileExactHigh {#quantileexacthigh}

Аналогично `quantileExact`, эта функция вычисляет точный [квантиль](https://en.wikipedia.org/wiki/Quantile) последовательности числовых данных.

Все переданные значения объединяются в массив, который затем полностью сортируется для получения точного значения. Сложность [алгоритма сортировки](https://en.cppreference.com/w/cpp/algorithm/sort) составляет `O(N·log(N))`, где `N = std::distance(first, last)` сравнений.

Возвращаемое значение зависит от уровня квантили и количества элементов в выборке, например, если уровень равен 0.5, то функция возвращает большее из двух медианных значений для чётного числа элементов и среднее (единственное) медианное значение для нечётного числа элементов. Медиана вычисляется аналогично реализации функции [median&#95;high](https://docs.python.org/3/library/statistics.html#statistics.median_high), которая используется в Python. Для всех остальных уровней возвращается элемент по индексу, соответствующему значению `level * size_of_array`.

Эта реализация ведёт себя точно так же, как текущая реализация функции `quantileExact`.

При использовании нескольких функций `quantile*` с разными уровнями в одном запросе их внутренние состояния не объединяются (то есть запрос выполняется менее эффективно, чем мог бы). В таком случае используйте функцию [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles).

**Синтаксис**

```sql
quantileExactHigh(level)(expr)
```

Синоним: `medianExactHigh`.

**Аргументы**

* `level` — уровень квантиля. Необязательный параметр. Константное число с плавающей запятой от 0 до 1. Рекомендуется использовать значение `level` в диапазоне `[0.01, 0.99]`. Значение по умолчанию: 0.5. При `level=0.5` функция вычисляет [медиану](https://en.wikipedia.org/wiki/Median).
* `expr` — выражение над значениями столбца, результатом которого будут числовые [типы данных](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) или [DateTime](../../../sql-reference/data-types/datetime.md).

**Возвращаемое значение**

* Квантиль указанного уровня.

Тип:

* [Float64](../../../sql-reference/data-types/float.md) для числового типа данных.
* [Date](../../../sql-reference/data-types/date.md), если входные значения имеют тип `Date`.
* [DateTime](../../../sql-reference/data-types/datetime.md), если входные значения имеют тип `DateTime`.

**Пример**

Запрос:

```sql
SELECT quantileExactHigh(number) FROM numbers(10)
```

Результат:

```text
┌─quantileExactHigh(number)─┐
│                         5 │
└───────────────────────────┘
```

## quantileExactExclusive {#quantileexactexclusive}

Точно вычисляет [квантиль](https://en.wikipedia.org/wiki/Quantile) последовательности числовых данных.

Чтобы получить точное значение, все переданные значения объединяются в массив, который затем частично сортируется. Поэтому функция потребляет `O(n)` памяти, где `n` — количество переданных значений. Однако для небольшого количества значений функция очень эффективна.

Эта функция эквивалентна функции Excel [PERCENTILE.EXC](https://support.microsoft.com/en-us/office/percentile-exc-function-bbaa7204-e9e1-4010-85bf-c31dc5dce4ba) ([тип R6](https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample)).

При использовании нескольких функций `quantileExactExclusive` с разными уровнями в одном запросе их внутренние состояния не объединяются (то есть запрос работает менее эффективно, чем мог бы). В этом случае используйте функцию [quantilesExactExclusive](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantilesexactexclusive).

**Синтаксис**

```sql
quantileExactExclusive(level)(expr)
```

**Аргументы**

* `expr` — выражение над значениями столбца, результатом которого являются числовые [типы данных](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) или [DateTime](../../../sql-reference/data-types/datetime.md).

**Параметры**

* `level` — уровень квантиля. Необязательный параметр. Допустимые значения: (0, 1) — границы не включены. Значение по умолчанию: 0.5. При `level=0.5` функция вычисляет [медиану](https://en.wikipedia.org/wiki/Median). Тип параметра: [Float](../../../sql-reference/data-types/float.md).

**Возвращаемое значение**

* Квантиль указанного уровня.

Тип:

* [Float64](../../../sql-reference/data-types/float.md) для числового типа данных на входе.
* [Date](../../../sql-reference/data-types/date.md), если входные значения имеют тип `Date`.
* [DateTime](../../../sql-reference/data-types/datetime.md), если входные значения имеют тип `DateTime`.

**Пример**

Запрос:

```sql
CREATE TABLE num AS numbers(1000);

SELECT quantileExactExclusive(0.6)(x) FROM (SELECT number AS x FROM num);
```

Результат:

```text
┌─quantileExactExclusive(0.6)(x)─┐
│                          599.6 │
└────────────────────────────────┘
```

## quantileExactInclusive {#quantileexactinclusive}

Точно вычисляет [квантиль](https://en.wikipedia.org/wiki/Quantile) числовой последовательности данных.

Чтобы получить точное значение, все переданные значения объединяются в массив, который затем частично сортируется. Поэтому функция потребляет `O(n)` памяти, где `n` — количество переданных значений. Однако при небольшом количестве значений функция работает очень эффективно.

Эта функция эквивалентна функции Excel [PERCENTILE.INC](https://support.microsoft.com/en-us/office/percentile-inc-function-680f9539-45eb-410b-9a5e-c1355e5fe2ed) ([тип R7](https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample)).

При использовании нескольких функций `quantileExactInclusive` с разными уровнями в одном запросе их внутренние состояния не объединяются (то есть запрос работает менее эффективно, чем мог бы). В этом случае используйте функцию [quantilesExactInclusive](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantilesexactinclusive).

**Синтаксис**

```sql
quantileExactInclusive(level)(expr)
```

**Аргументы**

* `expr` — выражение над значениями столбца, которое возвращает числовые [типы данных](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) или [DateTime](../../../sql-reference/data-types/datetime.md).

**Параметры**

* `level` — уровень квантиля. Необязательный параметр. Возможные значения: [0, 1] — границы включены. Значение по умолчанию: 0.5. При `level=0.5` функция вычисляет [медиану](https://en.wikipedia.org/wiki/Median). [Float](../../../sql-reference/data-types/float.md).

**Возвращаемое значение**

* Квантиль указанного уровня.

Тип:

* [Float64](../../../sql-reference/data-types/float.md) для числового типа данных на входе.
* [Date](../../../sql-reference/data-types/date.md), если входные значения имеют тип `Date`.
* [DateTime](../../../sql-reference/data-types/datetime.md), если входные значения имеют тип `DateTime`.

**Пример**

Запрос:

```sql
CREATE TABLE num AS numbers(1000);

SELECT quantileExactInclusive(0.6)(x) FROM (SELECT number AS x FROM num);
```

Результат:

```text
┌─quantileExactInclusive(0.6)(x)─┐
│                          599.4 │
└────────────────────────────────┘
```

**См. также**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
