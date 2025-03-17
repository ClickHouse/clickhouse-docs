---
slug: /sql-reference/aggregate-functions/reference/quantileInterpolatedWeighted
sidebar_position: 176
title: 'quantileInterpolatedWeighted'
description: 'Вычисляет квантиль числовой последовательности данных с использованием линейной интерполяции, принимая во внимание вес каждого элемента.'
---


# quantileInterpolatedWeighted

Вычисляет [квантиль](https://ru.wikipedia.org/wiki/Квантиль) числовой последовательности данных с использованием линейной интерполяции, принимая во внимание вес каждого элемента.

Чтобы получить интерполированное значение, все переданные значения объединяются в массив, который затем сортируется по соответствующим весам. Интерполяция квантиля выполняется с использованием [весового метода процентилей](https://ru.wikipedia.org/wiki/Процентиль#Весовой_метод_процентилей) путем построения кумулятивного распределения на основе весов, а затем выполняется линейная интерполяция с использованием весов и значений для вычисления квантилей.

При использовании нескольких функций `quantile*` с разными уровнями в запросе внутренние состояния не комбинируются (то есть запрос работает менее эффективно, чем мог бы). В этом случае используйте функцию [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles).

**Синтаксис**

``` sql
quantileInterpolatedWeighted(level)(expr, weight)
```

Псевдоним: `medianInterpolatedWeighted`.

**Аргументы**

- `level` — Уровень квантиля. Необязательный параметр. Константное число с плавающей запятой от 0 до 1. Рекомендуется использовать значение `level` в диапазоне `[0.01, 0.99]`. Значение по умолчанию: 0.5. При `level=0.5` функция вычисляет [медиану](https://ru.wikipedia.org/wiki/Медиана).
- `expr` — Выражение по значениям колонки, результирующее в числовые [типы данных](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) или [DateTime](../../../sql-reference/data-types/datetime.md).
- `weight` — Колонка с весами членов последовательности. Вес — это число вхождений значения.

**Возвращаемое значение**

- Квантиль указанного уровня.

Типы:

- [Float64](../../../sql-reference/data-types/float.md) для числовых входных данных.
- [Date](../../../sql-reference/data-types/date.md) если входные значения имеют тип `Date`.
- [DateTime](../../../sql-reference/data-types/datetime.md) если входные значения имеют тип `DateTime`.

**Пример**

Входная таблица:

``` text
┌─n─┬─val─┐
│ 0 │   3 │
│ 1 │   2 │
│ 2 │   1 │
│ 5 │   4 │
└───┴─────┘
```

Запрос:

``` sql
SELECT quantileInterpolatedWeighted(n, val) FROM t
```

Результат:

``` text
┌─quantileInterpolatedWeighted(n, val)─┐
│                                    1 │
└──────────────────────────────────────┘
```

**См. также**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
