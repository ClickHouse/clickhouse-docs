---
slug: '/sql-reference/aggregate-functions/reference/quantileExactWeightedInterpolated'
sidebar_position: 176
description: 'Вычисляет квантиль числовой последовательности данных с использованием'
title: quantileExactWeightedInterpolated
doc_type: reference
---
# quantileExactWeightedInterpolated

Вычисляет [квантили](https://ru.wikipedia.org/wiki/Квантиль) числовой последовательности данных с использованием линейной интерполяции, учитывая вес каждого элемента.

Чтобы получить интерполированное значение, все переданные значения объединяются в массив, который затем сортируется по соответствующим весам. Интерполяция квантили затем выполняется с использованием [взвешенного метода перцентиля](https://en.wikipedia.org/wiki/Percentile#The_weighted_percentile_method) путем построения кумулятивного распределения на основе весов, а затем выполняется линейная интерполяция с использованием весов и значений для вычисления квантилей.

При использовании нескольких функций `quantile*` с различными уровнями в запросе внутренние состояния не комбинируются (то есть запрос работает менее эффективно, чем мог бы). В этом случае используйте функцию [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles).

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

- `level` — Уровень квантили. Необязательный параметр. Константное число с плавающей запятой от 0 до 1. Рекомендуем использовать значение `level` в диапазоне `[0.01, 0.99]`. Значение по умолчанию: 0.5. При `level=0.5` функция вычисляет [медиану](https://ru.wikipedia.org/wiki/Медиана).
- `expr` — Выражение над значениями колонок, результатом которого являются числовые [типы данных](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) или [DateTime](../../../sql-reference/data-types/datetime.md).
- `weight` — Колонка с весами членов последовательности. Вес — это количество вхождений значения с [беззнаковыми целыми типами](../../../sql-reference/data-types/int-uint.md).

**Возвращаемое значение**

- Квантиль указанного уровня.

Тип:

- [Float64](../../../sql-reference/data-types/float.md) для входного числового типа данных.
- [Date](../../../sql-reference/data-types/date.md), если входные значения имеют тип `Date`.
- [DateTime](../../../sql-reference/data-types/datetime.md), если входные значения имеют тип `DateTime`.

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