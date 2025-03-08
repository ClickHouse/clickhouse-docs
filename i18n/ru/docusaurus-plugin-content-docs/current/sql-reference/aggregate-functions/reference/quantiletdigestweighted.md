---
slug: /sql-reference/aggregate-functions/reference/quantiletdigestweighted
sidebar_position: 179
title: "quantileTDigestWeighted"
description: "Вычисляет приближенный квантиль числовой последовательности данных с использованием алгоритма t-digest."
---


# quantileTDigestWeighted

Вычисляет приближенный [квантиль](https://ru.wikipedia.org/wiki/%D0%9A%D0%B2%D0%B0%D0%BD%D1%82%D1%8B%D0%BB%D1%8C) числовой последовательности данных с использованием алгоритма [t-digest](https://github.com/tdunning/t-digest/blob/master/docs/t-digest-paper/histo.pdf). Функция учитывает вес каждого элемента последовательности. Максимальная ошибка составляет 1%. Потребление памяти равно `log(n)`, где `n` — это число значений.

Производительность функции ниже, чем у [quantile](/sql-reference/aggregate-functions/reference/quantile) или [quantileTiming](/sql-reference/aggregate-functions/reference/quantiletiming). С точки зрения соотношения размера состояния к точности, эта функция намного лучше, чем `quantile`.

Результат зависит от порядка выполнения запроса и является недетерминированным.

При использовании нескольких функций `quantile*` с различными уровнями в запросе внутренние состояния не комбинируются (то есть запрос работает менее эффективно, чем мог бы). В этом случае используйте функцию [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles).

:::note    
Использование `quantileTDigestWeighted` [не рекомендуется для маленьких наборов данных](https://github.com/tdunning/t-digest/issues/167#issuecomment-828650275) и может привести к значительным ошибкам. В этом случае рассмотрите возможность использования [`quantileTDigest`](../../../sql-reference/aggregate-functions/reference/quantiletdigest.md) вместо.
:::

**Синтаксис**

``` sql
quantileTDigestWeighted(level)(expr, weight)
```

Псевдоним: `medianTDigestWeighted`.

**Аргументы**

- `level` — Уровень квантиля. Опциональный параметр. Константное число с плавающей точкой от 0 до 1. Рекомендуем использовать значение `level` в диапазоне `[0.01, 0.99]`. Значение по умолчанию: 0.5. При `level=0.5` функция вычисляет [медиану](https://ru.wikipedia.org/wiki/%D0%9C%D0%B5%D0%B4%D0%B8%D0%B0%D0%BD).
- `expr` — Выражение над значениями колонок, результатом которого являются числовые [типы данных](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) или [DateTime](../../../sql-reference/data-types/datetime.md).
- `weight` — Колонка с весами элементов последовательности. Вес — это количество вхождений значения.

**Возвращаемое значение**

- Приближенный квантиль указанного уровня.

Тип:

- [Float64](../../../sql-reference/data-types/float.md) для числового типа данных.
- [Date](../../../sql-reference/data-types/date.md), если входные значения имеют тип `Date`.
- [DateTime](../../../sql-reference/data-types/datetime.md), если входные значения имеют тип `DateTime`.

**Пример**

Запрос:

``` sql
SELECT quantileTDigestWeighted(number, 1) FROM numbers(10)
```

Результат:

``` text
┌─quantileTDigestWeighted(number, 1)─┐
│                                4.5 │
└────────────────────────────────────┘
```

**См. также**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
