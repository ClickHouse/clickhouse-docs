---
description: 'Вычисляет квантиль числовой последовательности данных с использованием линейной интерполяции, учитывая вес каждого элемента.'
sidebar_position: 176
slug: /sql-reference/aggregate-functions/reference/quantileExactWeightedInterpolated
title: 'quantileExactWeightedInterpolated'
---


# quantileExactWeightedInterpolated

Вычисляет [квантиль](https://en.wikipedia.org/wiki/Quantile) числовой последовательности данных с использованием линейной интерполяции, учитывая вес каждого элемента.

Чтобы получить интерполированное значение, все переданные значения объединяются в массив, который затем сортируется по их соответствующим весам. Интерполяция квантиля затем выполняется с использованием [взвешенного метода_PERCENTILE](https://en.wikipedia.org/wiki/Percentile#The_weighted_percentile_method) путем построения кумулятивной распределения на основе весов, а затем выполняется линейная интерполяция с использованием весов и значений для вычисления квантилей.

При использовании нескольких функций `quantile*` с различными уровнями в запросе внутренние состояния не объединяются (то есть запрос работает менее эффективно, чем мог бы). В этом случае используйте функцию [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles).

Мы настоятельно рекомендуем использовать `quantileExactWeightedInterpolated` вместо `quantileInterpolatedWeighted`, так как `quantileExactWeightedInterpolated` более точен, чем `quantileInterpolatedWeighted`. Вот пример:

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

- `level` — Уровень квантиля. Необязательный параметр. Константа с плавающей запятой от 0 до 1. Мы рекомендуем использовать значение `level` в диапазоне `[0.01, 0.99]`. Значение по умолчанию: 0.5. При `level=0.5` функция вычисляет [медиану](https://en.wikipedia.org/wiki/Median).
- `expr` — Выражение над значениями столбца, результатом которого являются числовые [типы данных](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) или [DateTime](../../../sql-reference/data-types/datetime.md).
- `weight` — Столбец с весами членов последовательности. Вес — это количество появлений значения с [Безнаковыми целыми типами](../../../sql-reference/data-types/int-uint.md).

**Возвращаемое значение**

- Квантиль заданного уровня.

Тип:

- [Float64](../../../sql-reference/data-types/float.md) для ввода с числовым типом данных.
- [Date](../../../sql-reference/data-types/date.md) если входные значения имеют тип `Date`.
- [DateTime](../../../sql-reference/data-types/datetime.md) если входные значения имеют тип `DateTime`.

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

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
