---
description: 'Вычисляет приближенный квантиль числовой последовательности данных с использованием алгоритма t-digest.'
sidebar_position: 178
slug: /sql-reference/aggregate-functions/reference/quantiletdigest
title: 'quantileTDigest'
---


# quantileTDigest

Вычисляет приближенный [квантиль](https://en.wikipedia.org/wiki/Quantile) числовой последовательности данных с использованием алгоритма [t-digest](https://github.com/tdunning/t-digest/blob/master/docs/t-digest-paper/histo.pdf).

Потребление памяти составляет `log(n)`, где `n` — количество значений. Результат зависит от порядка выполнения запроса и является недетерминированным.

Производительность функции ниже, чем производительность [quantile](/sql-reference/aggregate-functions/reference/quantile) или [quantileTiming](/sql-reference/aggregate-functions/reference/quantiletiming). В терминах соотношения объема состояния к точности эта функция значительно лучше, чем `quantile`.

При использовании нескольких функций `quantile*` с разными уровнями в одном запросе внутренние состояния не комбинируются (то есть запрос работает менее эффективно, чем мог бы). В этом случае используйте функцию [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles).

**Синтаксис**

```sql
quantileTDigest(level)(expr)
```

Псевдоним: `medianTDigest`.

**Аргументы**

- `level` — Уровень квантили. Опциональный параметр. Константное число с плавающей запятой от 0 до 1. Рекомендуем использовать значение `level` в диапазоне `[0.01, 0.99]`. Значение по умолчанию: 0.5. При `level=0.5` функция вычисляет [медиану](https://en.wikipedia.org/wiki/Median).
- `expr` — Выражение над значениями колонки, приводящее к числовым [типам данных](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) или [DateTime](../../../sql-reference/data-types/datetime.md).

**Возвращаемое значение**

- Приближенный квантиль указанного уровня.

Тип:

- [Float64](../../../sql-reference/data-types/float.md) для входного числового типа данных.
- [Date](../../../sql-reference/data-types/date.md), если входные значения имеют тип `Date`.
- [DateTime](../../../sql-reference/data-types/datetime.md), если входные значения имеют тип `DateTime`.

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

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](/sql-reference/aggregate-functions/reference/quantiles)
