---
description: 'Вычисляет приближённое значение квантили для числовой последовательности данных с использованием алгоритма t-digest.'
sidebar_position: 178
slug: /sql-reference/aggregate-functions/reference/quantiletdigest
title: 'quantileTDigest'
doc_type: 'reference'
---

# quantileTDigest

Вычисляет приблизительный [квантиль](https://en.wikipedia.org/wiki/Quantile) последовательности числовых данных с использованием алгоритма [t-digest](https://github.com/tdunning/t-digest/blob/master/docs/t-digest-paper/histo.pdf).

Потребление памяти составляет `log(n)`, где `n` — количество значений. Результат зависит от порядка выполнения запроса и является недетерминированным.

Производительность функции ниже, чем у [quantile](/sql-reference/aggregate-functions/reference/quantile) или [quantileTiming](/sql-reference/aggregate-functions/reference/quantiletiming). С точки зрения соотношения размера состояния и точности эта функция значительно лучше, чем `quantile`.

При использовании нескольких функций `quantile*` с разными уровнями в одном запросе внутренние состояния не объединяются (то есть запрос работает менее эффективно, чем мог бы). В этом случае используйте функцию [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles).

**Синтаксис**

```sql
quantileTDigest(level)(expr)
```

Псевдоним: `medianTDigest`.

**Аргументы**

* `level` — Уровень квантиля. Необязательный параметр. Константное число с плавающей запятой от 0 до 1. Рекомендуется использовать значение `level` в диапазоне `[0.01, 0.99]`. Значение по умолчанию: 0.5. При `level=0.5` функция вычисляет [медиану](https://en.wikipedia.org/wiki/Median).
* `expr` — Выражение над значениями столбца, результатом которого является числовой [тип данных](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) или [DateTime](../../../sql-reference/data-types/datetime.md).

**Возвращаемое значение**

* Приближённый квантиль указанного уровня.

Тип:

* [Float64](../../../sql-reference/data-types/float.md) для входных данных числового типа.
* [Date](../../../sql-reference/data-types/date.md), если входные значения имеют тип `Date`.
* [DateTime](../../../sql-reference/data-types/datetime.md), если входные значения имеют тип `DateTime`.

**Пример**

Запрос:

```sql
SELECT quantileTDigest(number) FROM numbers(10)
```

Результат:

```text
┌─quantileTDigest(number)─┐
│                     4.5 │
└─────────────────────────┘
```

**См. также**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](/sql-reference/aggregate-functions/reference/quantiles)
