---
description: 'Вычисляет квантиль числовой последовательности данных с использованием линейной интерполяции, принимая во внимание вес каждого элемента.'
sidebar_position: 176
slug: /sql-reference/aggregate-functions/reference/quantileInterpolatedWeighted
title: 'quantileInterpolatedWeighted'
---


# quantileInterpolatedWeighted

Вычисляет [квантиль](https://en.wikipedia.org/wiki/Quantile) числовой последовательности данных с использованием линейной интерполяции, принимая во внимание вес каждого элемента.

Чтобы получить интерполированное значение, все переданные значения объединяются в массив, который затем сортируется по соответствующим весам. Интерполяция квантилей затем выполняется с использованием [взвешенного метода процентилей](https://en.wikipedia.org/wiki/Percentile#The_weighted_percentile_method) путем построения кумулятивного распределения на основе весов, а затем выполняется линейная интерполяция с использованием весов и значений для вычисления квантилей.

При использовании нескольких функций `quantile*` с разными уровнями в запросе внутренние состояния не объединяются (то есть запрос работает менее эффективно, чем мог бы). В этом случае используйте функцию [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles).

**Синтаксис**

```sql
quantileInterpolatedWeighted(level)(expr, weight)
```

Псевдоним: `medianInterpolatedWeighted`.

**Аргументы**

- `level` — Уровень квантиля. Необязательный параметр. Константное число с плавающей запятой от 0 до 1. Рекомендуется использовать значение `level` в диапазоне `[0.01, 0.99]`. Значение по умолчанию: 0.5. При `level=0.5` функция вычисляет [медиану](https://en.wikipedia.org/wiki/Median).
- `expr` — Выражение по значениям колонки, приводящее к числовым [типам данных](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) или [DateTime](../../../sql-reference/data-types/datetime.md).
- `weight` — Колонка с весами членов последовательности. Вес — это количество вхождений значения.

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

**Смотрите также**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
