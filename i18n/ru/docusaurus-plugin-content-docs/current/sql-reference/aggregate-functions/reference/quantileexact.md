---
slug: '/sql-reference/aggregate-functions/reference/quantileexact'
sidebar_position: 173
description: 'quantileExact, quantileExactLow, quantileExactHigh, quantileExactExclusive,'
title: 'Функции quantileExact'
doc_type: reference
---
# quantileExact функции

## quantileExact {#quantileexact}

Точно вычисляет [квантиль](https://en.wikipedia.org/wiki/Quantile) числовой последовательности данных.

Чтобы получить точное значение, все переданные значения объединяются в массив, который затем частично сортируется. Поэтому функция потребляет `O(n)` памяти, где `n` — это количество переданных значений. Однако для небольшого количества значений функция очень эффективна.

При использовании нескольких `quantile*` функций с разными уровнями в запросе внутренние состояния не комбинируются (то есть запрос работает менее эффективно, чем мог бы). В этом случае используйте функцию [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles).

**Синтаксис**

```sql
quantileExact(level)(expr)
```

Псевдоним: `medianExact`.

**Аргументы**

- `level` — Уровень квантиля. Необязательный параметр. Константное число с плавающей точкой от 0 до 1. Мы рекомендуем использовать значение `level` в диапазоне `[0.01, 0.99]`. Значение по умолчанию: 0.5. При `level=0.5` функция вычисляет [медиану](https://en.wikipedia.org/wiki/Median).
- `expr` — Выражение для значений колонок, приводящее к числовым [типам данных](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) или [DateTime](../../../sql-reference/data-types/datetime.md).

**Возвращаемое значение**

- Квантиль указанного уровня.

Тип:

- Для числовых типов данных выходной формат будет таким же, как и формат входных данных. Например:

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

- [Date](../../../sql-reference/data-types/date.md), если входные значения имеют тип `Date`.
- [DateTime](../../../sql-reference/data-types/datetime.md), если входные значения имеют тип `DateTime`.

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

Похожая на `quantileExact`, эта функция вычисляет точный [квантиль](https://en.wikipedia.org/wiki/Quantile) числовой последовательности данных.

Чтобы получить точное значение, все переданные значения объединяются в массив, который затем полностью сортируется. Сложность [алгоритма сортировки](https://en.cppreference.com/w/cpp/algorithm/sort) составляет `O(N·log(N))`, где `N = std::distance(first, last)` — количество сравнений.

Возвращаемое значение зависит от уровня квантиля и количества элементов в выборке, т.е. если уровень равен 0.5, то функция возвращает нижнее медианное значение для четного количества элементов и среднее медианное значение для нечетного количества элементов. Медиана вычисляется аналогично реализации [median_low](https://docs.python.org/3/library/statistics.html#statistics.median_low), которая используется в python.

Для всех остальных уровней возвращается элемент по индексу, соответствующему значению `level * size_of_array`. Например:

```sql
SELECT quantileExactLow(0.1)(number) FROM numbers(10)

┌─quantileExactLow(0.1)(number)─┐
│                             1 │
└───────────────────────────────┘
```

При использовании нескольких `quantile*` функций с разными уровнями в запросе внутренние состояния не комбинируются (то есть запрос работает менее эффективно, чем мог бы). В этом случае используйте функцию [quantiles](/sql-reference/aggregate-functions/reference/quantiles).

**Синтаксис**

```sql
quantileExactLow(level)(expr)
```

Псевдоним: `medianExactLow`.

**Аргументы**

- `level` — Уровень квантиля. Необязательный параметр. Константное число с плавающей точкой от 0 до 1. Мы рекомендуем использовать значение `level` в диапазоне `[0.01, 0.99]`. Значение по умолчанию: 0.5. При `level=0.5` функция вычисляет [медиану](https://en.wikipedia.org/wiki/Median).
- `expr` — Выражение для значений колонок, приводящее к числовым [типам данных](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) или [DateTime](../../../sql-reference/data-types/datetime.md).

**Возвращаемое значение**

- Квантиль указанного уровня.

Тип:

- [Float64](../../../sql-reference/data-types/float.md) для входных данных числового типа.
- [Date](../../../sql-reference/data-types/date.md), если входные значения имеют тип `Date`.
- [DateTime](../../../sql-reference/data-types/datetime.md), если входные значения имеют тип `DateTime`.

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

Похожая на `quantileExact`, эта функция вычисляет точный [квантиль](https://en.wikipedia.org/wiki/Quantile) числовой последовательности данных.

Все переданные значения объединяются в массив, который затем полностью сортируется, чтобы получить точное значение. Сложность [алгоритма сортировки](https://en.cppreference.com/w/cpp/algorithm/sort) составляет `O(N·log(N))`, где `N = std::distance(first, last)` — количество сравнений.

Возвращаемое значение зависит от уровня квантиля и количества элементов в выборке, т.е. если уровень равен 0.5, то функция возвращает верхнее медианное значение для четного количества элементов и среднее медианное значение для нечетного количества элементов. Медиана вычисляется аналогично реализации [median_high](https://docs.python.org/3/library/statistics.html#statistics.median_high), которая используется в python. Для всех остальных уровней возвращается элемент по индексу, соответствующему значению `level * size_of_array`.

Эта реализация ведет себя точно так же, как и текущая реализация `quantileExact`.

При использовании нескольких `quantile*` функций с разными уровнями в запросе внутренние состояния не комбинируются (то есть запрос работает менее эффективно, чем мог бы). В этом случае используйте функцию [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles).

**Синтаксис**

```sql
quantileExactHigh(level)(expr)
```

Псевдоним: `medianExactHigh`.

**Аргументы**

- `level` — Уровень квантиля. Необязательный параметр. Константное число с плавающей точкой от 0 до 1. Мы рекомендуем использовать значение `level` в диапазоне `[0.01, 0.99]`. Значение по умолчанию: 0.5. При `level=0.5` функция вычисляет [медиану](https://en.wikipedia.org/wiki/Median).
- `expr` — Выражение для значений колонок, приводящее к числовым [типам данных](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) или [DateTime](../../../sql-reference/data-types/datetime.md).

**Возвращаемое значение**

- Квантиль указанного уровня.

Тип:

- [Float64](../../../sql-reference/data-types/float.md) для входных данных числового типа.
- [Date](../../../sql-reference/data-types/date.md), если входные значения имеют тип `Date`.
- [DateTime](../../../sql-reference/data-types/datetime.md), если входные значения имеют тип `DateTime`.

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

Точно вычисляет [квантиль](https://en.wikipedia.org/wiki/Quantile) числовой последовательности данных.

Чтобы получить точное значение, все переданные значения объединяются в массив, который затем частично сортируется. Поэтому функция потребляет `O(n)` памяти, где `n` — это количество переданных значений. Однако для небольшого количества значений функция очень эффективна.

Эта функция эквивалентна функции Excel [PERCENTILE.EXC](https://support.microsoft.com/en-us/office/percentile-exc-function-bbaa7204-e9e1-4010-85bf-c31dc5dce4ba) ([тип R6](https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample)).

При использовании нескольких `quantileExactExclusive` функций с разными уровнями в запросе внутренние состояния не комбинируются (то есть запрос работает менее эффективно, чем мог бы). В этом случае используйте функцию [quantilesExactExclusive](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantilesexactexclusive).

**Синтаксис**

```sql
quantileExactExclusive(level)(expr)
```

**Аргументы**

- `expr` — Выражение для значений колонок, приводящее к числовым [типам данных](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) или [DateTime](../../../sql-reference/data-types/datetime.md).

**Параметры**

- `level` — Уровень квантиля. Необязательный. Возможные значения: (0, 1) — границы не включены. Значение по умолчанию: 0.5. При `level=0.5` функция вычисляет [медиану](https://en.wikipedia.org/wiki/Median). [Float](../../../sql-reference/data-types/float.md).

**Возвращаемое значение**

- Квантиль указанного уровня.

Тип:

- [Float64](../../../sql-reference/data-types/float.md) для входных данных числового типа.
- [Date](../../../sql-reference/data-types/date.md), если входные значения имеют тип `Date`.
- [DateTime](../../../sql-reference/data-types/datetime.md), если входные значения имеют тип `DateTime`.

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

Чтобы получить точное значение, все переданные значения объединяются в массив, который затем частично сортируется. Поэтому функция потребляет `O(n)` памяти, где `n` — это количество переданных значений. Однако для небольшого количества значений функция очень эффективна.

Эта функция эквивалентна функции Excel [PERCENTILE.INC](https://support.microsoft.com/en-us/office/percentile-inc-function-680f9539-45eb-410b-9a5e-c1355e5fe2ed) ([тип R7](https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample)).

При использовании нескольких `quantileExactInclusive` функций с разными уровнями в запросе внутренние состояния не комбинируются (то есть запрос работает менее эффективно, чем мог бы). В этом случае используйте функцию [quantilesExactInclusive](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantilesexactinclusive).

**Синтаксис**

```sql
quantileExactInclusive(level)(expr)
```

**Аргументы**

- `expr` — Выражение для значений колонок, приводящее к числовым [типам данных](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) или [DateTime](../../../sql-reference/data-types/datetime.md).

**Параметры**

- `level` — Уровень квантиля. Необязательный. Возможные значения: [0, 1] — границы включены. Значение по умолчанию: 0.5. При `level=0.5` функция вычисляет [медиану](https://en.wikipedia.org/wiki/Median). [Float](../../../sql-reference/data-types/float.md).

**Возвращаемое значение**

- Квантиль указанного уровня.

Тип:

- [Float64](../../../sql-reference/data-types/float.md) для входных данных числового типа.
- [Date](../../../sql-reference/data-types/date.md), если входные значения имеют тип `Date`.
- [DateTime](../../../sql-reference/data-types/datetime.md), если входные значения имеют тип `DateTime`.

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

**Смотрите также**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)