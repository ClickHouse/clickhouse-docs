---
description: 'Вычисляет квантиль последовательности числовых данных с использованием линейной интерполяции с учётом веса каждого элемента.'
sidebar_position: 176
slug: /sql-reference/aggregate-functions/reference/quantileExactWeightedInterpolated
title: 'quantileExactWeightedInterpolated'
doc_type: 'reference'
---

# quantileExactWeightedInterpolated {#quantileexactweightedinterpolated}

Вычисляет [квантиль](https://en.wikipedia.org/wiki/Quantile) числовой последовательности данных с использованием линейной интерполяции с учётом веса каждого элемента.

Для получения интерполированного значения все переданные значения объединяются в массив, который затем сортируется по соответствующим им весам. После этого квантиль интерполируется с помощью [метода взвешенного процентиля](https://en.wikipedia.org/wiki/Percentile#The_weighted_percentile_method): по весам строится кумулятивное распределение, затем выполняется линейная интерполяция, использующая веса и значения для вычисления квантилей.

При использовании нескольких функций `quantile*` с разными уровнями в одном запросе их внутренние состояния не объединяются (то есть запрос работает менее эффективно, чем мог бы). В таком случае используйте функцию [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles).

Мы настоятельно рекомендуем использовать `quantileExactWeightedInterpolated` вместо `quantileInterpolatedWeighted`, поскольку `quantileExactWeightedInterpolated` обеспечивает более высокую точность, чем `quantileInterpolatedWeighted`. Ниже приведён пример:

```sql
SELECT
    quantileExactWeightedInterpolated(0.99)(number, 1),
    quantile(0.99)(number),
    quantileInterpolatedWeighted(0.99)(number, 1)
FROM numbers(9)
┌─quantileExactWeightedInterpolated(0.99)(number, 1)─┬─quantile(0.99)(number)─┬─quantileInterpolatedWeighted(0.99)(number, 1)─┐
│                                               7.92 │                   7.92 │                                             8 │
└────────────────────────────────────────────────────┴────────────────────────┴───────────────────────────────────────────────┘
```

**Синтаксис**

```sql
quantileExactWeightedInterpolated(level)(expr, weight)
```

Псевдоним: `medianExactWeightedInterpolated`.

**Аргументы**

* `level` — Уровень квантиля. Необязательный параметр. Константное число с плавающей запятой от 0 до 1. Рекомендуется использовать значение `level` в диапазоне `[0.01, 0.99]`. Значение по умолчанию: 0.5. При `level=0.5` функция вычисляет [медиану](https://en.wikipedia.org/wiki/Median).
* `expr` — Выражение над значениями столбца, результатом которого является числовой [тип данных](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) или [DateTime](../../../sql-reference/data-types/datetime.md).
* `weight` — Столбец с весами элементов последовательности. Вес — это количество вхождений значения, представленное [беззнаковым целочисленным типом](../../../sql-reference/data-types/int-uint.md).

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

Результат:

```text
┌─quantileExactWeightedInterpolated(n, val)─┐
│                                       1.5 │
└───────────────────────────────────────────┘
```

**См. также**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
