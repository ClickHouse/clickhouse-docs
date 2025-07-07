---
description: 'Вычисляет приблизительный квантиль числовой последовательности данных.'
sidebar_position: 172
slug: /sql-reference/aggregate-functions/reference/quantiledeterministic
title: 'quantileDeterministic'
---


# quantileDeterministic

Вычисляет приблизительный [квантиль](https://en.wikipedia.org/wiki/Quantile) числовой последовательности данных.

Эта функция применяет [резервуарное выборочное наблюдение](https://en.wikipedia.org/wiki/Reservoir_sampling) с размером резервуара до 8192 и детерминированным алгоритмом выборки. Результат является детерминированным. Чтобы получить точный квантиль, используйте функцию [quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact).

При использовании нескольких функций `quantile*` с разными уровнями в запросе внутренние состояния не комбинируются (то есть, запрос работает менее эффективно, чем мог бы). В этом случае используйте функцию [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles).

**Синтаксис**

```sql
quantileDeterministic(level)(expr, determinator)
```

Псевдоним: `medianDeterministic`.

**Аргументы**

- `level` — Уровень квантиля. Необязательный параметр. Константное число с плавающей точкой от 0 до 1. Рекомендуется использовать значение `level` в диапазоне `[0.01, 0.99]`. Значение по умолчанию: 0.5. При `level=0.5` функция вычисляет [медиану](https://en.wikipedia.org/wiki/Median).
- `expr` — Выражение для значений столбца, в результате которого получаются числовые [типы данных](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) или [DateTime](../../../sql-reference/data-types/datetime.md).
- `determinator` — Число, хеш которого используется вместо генератора случайных чисел в алгоритме резервуарного выборочного наблюдения, чтобы сделать результат выборки детерминированным. В качестве детерминатора можно использовать любое детерминированное положительное число, например, id пользователя или id события. Если одно и то же значение детерминатора встречается слишком часто, функция работает некорректно.

**Возвращаемое значение**

- Приблизительный квантиль указанного уровня.

Тип:

- [Float64](../../../sql-reference/data-types/float.md) для входного числового типа данных.
- [Date](../../../sql-reference/data-types/date.md), если входные значения имеют тип `Date`.
- [DateTime](../../../sql-reference/data-types/datetime.md), если входные значения имеют тип `DateTime`.

**Пример**

Входная таблица:

```text
┌─val─┐
│   1 │
│   1 │
│   2 │
│   3 │
└─────┘
```

Запрос:

```sql
SELECT quantileDeterministic(val, 1) FROM t
```

Результат:

```text
┌─quantileDeterministic(val, 1)─┐
│                           1.5 │
└───────────────────────────────┘
```

**Смотрите Также**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
