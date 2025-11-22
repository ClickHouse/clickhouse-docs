---
description: 'Вычисляет квантиль числовой последовательности данных на основе линейной интерполяции с учётом веса каждого элемента.'
sidebar_position: 176
slug: /sql-reference/aggregate-functions/reference/quantileInterpolatedWeighted
title: 'quantileInterpolatedWeighted'
doc_type: 'reference'
---

# quantileInterpolatedWeighted

Вычисляет [квантиль](https://en.wikipedia.org/wiki/Quantile) числовой последовательности данных с использованием линейной интерполяции с учётом веса каждого элемента.

Чтобы получить интерполированное значение, все переданные значения объединяются в массив, который затем сортируется по соответствующим весам. Далее интерполяция квантилей выполняется с использованием [метода взвешенных процентилей](https://en.wikipedia.org/wiki/Percentile#The_weighted_percentile_method): строится кумулятивное распределение на основе весов, после чего квантили вычисляются с помощью линейной интерполяции по весам и значениям.

При использовании нескольких функций `quantile*` с разными уровнями квантилей в одном запросе их внутренние состояния не объединяются (то есть запрос работает менее эффективно, чем мог бы). В этом случае используйте функцию [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles).

**Синтаксис**

```sql
quantileInterpolatedWeighted(level)(expr, weight)
```

Псевдоним: `medianInterpolatedWeighted`.

**Аргументы**

* `level` — уровень квантиля. Необязательный параметр. Константное число с плавающей запятой от 0 до 1. Рекомендуется использовать значение параметра `level` в диапазоне `[0.01, 0.99]`. Значение по умолчанию: 0.5. При `level=0.5` функция вычисляет [медиану](https://en.wikipedia.org/wiki/Median).
* `expr` — выражение над значениями столбца, результатом которого являются числовые [типы данных](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) или [DateTime](../../../sql-reference/data-types/datetime.md).
* `weight` — столбец с весами элементов последовательности. Вес — это количество вхождений значения.

**Возвращаемое значение**

* Квантиль указанного уровня.

Тип:

* [Float64](../../../sql-reference/data-types/float.md) для числового типа данных на входе.
* [Date](../../../sql-reference/data-types/date.md), если входные значения имеют тип `Date`.
* [DateTime](../../../sql-reference/data-types/datetime.md), если входные значения имеют тип `DateTime`.

**Пример**

Входная таблица:

```text
┌─n─┬─val─┐
│ 0 │   3 │
│ 1 │   2 │
│ 2 │   1 │
│ 5 │   4 │
└───┴─────┘
```

Запрос:

```sql
SELECT quantileInterpolatedWeighted(n, val) FROM t
```

Результат:

```text
┌─quantileInterpolatedWeighted(n, val)─┐
│                                    1 │
└──────────────────────────────────────┘
```

**См. также**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
