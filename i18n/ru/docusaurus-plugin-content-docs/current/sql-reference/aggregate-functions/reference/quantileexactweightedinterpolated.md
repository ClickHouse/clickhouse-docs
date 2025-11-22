---
description: 'Вычисляет квантиль последовательности числовых данных с использованием линейной интерполяции с учетом веса каждого элемента.'
sidebar_position: 176
slug: /sql-reference/aggregate-functions/reference/quantileExactWeightedInterpolated
title: 'quantileExactWeightedInterpolated'
doc_type: 'reference'
---

# quantileExactWeightedInterpolated

Вычисляет [квантиль](https://en.wikipedia.org/wiki/Quantile) числовой последовательности данных с использованием линейной интерполяции с учётом веса каждого элемента.

Чтобы получить интерполированное значение, все переданные значения объединяются в массив, который затем сортируется по соответствующим весам. Далее интерполяция квантилей выполняется с использованием [метода взвешенного процентиля](https://en.wikipedia.org/wiki/Percentile#The_weighted_percentile_method): строится кумулятивное распределение на основе весов, после чего выполняется линейная интерполяция с использованием весов и значений для вычисления квантилей.

При использовании в одном запросе нескольких функций `quantile*` с разными уровнями квантилей их внутренние состояния не комбинируются (то есть запрос работает менее эффективно, чем мог бы). В этом случае используйте функцию [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles).

Настоятельно рекомендуется использовать `quantileExactWeightedInterpolated` вместо `quantileInterpolatedWeighted`, поскольку `quantileExactWeightedInterpolated` обеспечивает более высокую точность, чем `quantileInterpolatedWeighted`. Ниже приведён пример:

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
* `expr` — Выражение над значениями столбца, результатом которого являются числовые [типы данных](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) или [DateTime](../../../sql-reference/data-types/datetime.md).
* `weight` — Столбец с весами элементов последовательности. Вес — это количество вхождений значения, представленное [беззнаковыми целочисленными типами](../../../sql-reference/data-types/int-uint.md).

**Возвращаемое значение**

* Квантиль указанного уровня.

Тип возвращаемого значения:

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
