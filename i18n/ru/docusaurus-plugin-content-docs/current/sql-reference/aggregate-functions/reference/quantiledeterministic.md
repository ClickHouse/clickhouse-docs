---
slug: /sql-reference/aggregate-functions/reference/quantiledeterministic
sidebar_position: 172
title: "quantileDeterministic"
description: "Вычисляет приблизительный квантиль числовой последовательности данных."
---


# quantileDeterministic

Вычисляет приблизительный [квантиль](https://en.wikipedia.org/wiki/Quantile) числовой последовательности данных.

Эта функция применяет [резервуарное многократное выборочное](https://en.wikipedia.org/wiki/Reservoir_sampling) с размером резервуара до 8192 и детерминистический алгоритм выборки. Результат является детерминистическим. Для получения точного квартили используйте функцию [quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact).

При использовании нескольких функций `quantile*` с разными уровнями в запросе внутренние состояния не комбинируются (то есть, запрос работает менее эффективно, чем мог бы). В этом случае используйте функцию [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles).

**Синтаксис**

``` sql
quantileDeterministic(level)(expr, determinator)
```

Псевдоним: `medianDeterministic`.

**Аргументы**

- `level` — Уровень квартили. Необязательный параметр. Константное число с плавающей точкой от 0 до 1. Рекомендуется использовать значение `level` в диапазоне `[0.01, 0.99]`. Значение по умолчанию: 0.5. При `level=0.5` функция вычисляет [медиану](https://en.wikipedia.org/wiki/Median).
- `expr` — Выражение над значениями колонки, приводящее к числовым [типам данных](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) или [DateTime](../../../sql-reference/data-types/datetime.md).
- `determinator` — Число, хэш которого используется вместо генератора случайных чисел в алгоритме резервуарного выборочного, чтобы сделать результат выборки детерминистическим. В качестве детерминатора вы можете использовать любое детерминистическое положительное число, например, идентификатор пользователя или идентификатор события. Если одно и то же значение детерминатора встречается слишком часто, функция работает некорректно.

**Возвращаемое значение**

- Приблизительный квантиль указанного уровня.

Тип:

- [Float64](../../../sql-reference/data-types/float.md) для входных данных числового типа.
- [Date](../../../sql-reference/data-types/date.md) если входные значения имеют тип `Date`.
- [DateTime](../../../sql-reference/data-types/datetime.md) если входные значения имеют тип `DateTime`.

**Пример**

Входная таблица:

``` text
┌─val─┐
│   1 │
│   1 │
│   2 │
│   3 │
└─────┘
```

Запрос:

``` sql
SELECT quantileDeterministic(val, 1) FROM t
```

Результат:

``` text
┌─quantileDeterministic(val, 1)─┐
│                           1.5 │
└───────────────────────────────┘
```

**Смотрите также**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
