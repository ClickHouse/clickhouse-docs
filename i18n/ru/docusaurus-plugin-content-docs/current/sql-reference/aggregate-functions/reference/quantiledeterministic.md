---
description: 'Вычисляет приближённое значение квантили числовой последовательности данных.'
sidebar_position: 172
slug: /sql-reference/aggregate-functions/reference/quantiledeterministic
title: 'quantileDeterministic'
doc_type: 'reference'
---

# quantileDeterministic

Вычисляет приближённый [квантиль](https://en.wikipedia.org/wiki/Quantile) числовой последовательности данных.

Эта функция использует [резервуарную выборку](https://en.wikipedia.org/wiki/Reservoir_sampling) с размером резервуара до 8192 и детерминированным алгоритмом выборки. Результат является детерминированным. Для получения точного квантиля используйте функцию [quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact).

При использовании нескольких функций `quantile*` с разными уровнями в одном запросе их внутренние состояния не объединяются (то есть запрос работает менее эффективно, чем мог бы). В этом случае используйте функцию [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles).

**Синтаксис**

```sql
quantileDeterministic(level)(expr, determinator)
```

Псевдоним: `medianDeterministic`.

**Аргументы**

* `level` — Уровень квантиля. Необязательный параметр. Константное число с плавающей запятой от 0 до 1. Рекомендуется использовать значение `level` в диапазоне `[0.01, 0.99]`. Значение по умолчанию: 0.5. При `level=0.5` функция вычисляет [медиану](https://en.wikipedia.org/wiki/Median).
* `expr` — Выражение над значениями столбца, результатом которого являются числовые [типы данных](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) или [DateTime](../../../sql-reference/data-types/datetime.md).
* `determinator` — Число, хеш которого используется вместо генератора случайных чисел в алгоритме резервуарной выборки, чтобы сделать результат выборки детерминированным. В качестве детерминатора можно использовать любое детерминированное положительное число, например идентификатор пользователя или идентификатор события. Если одно и то же значение детерминатора встречается слишком часто, функция может работать некорректно.

**Возвращаемое значение**

* Приближённый квантиль указанного уровня.

Тип:

* [Float64](../../../sql-reference/data-types/float.md) для числового типа данных на входе.
* [Date](../../../sql-reference/data-types/date.md), если входные значения имеют тип `Date`.
* [DateTime](../../../sql-reference/data-types/datetime.md), если входные значения имеют тип `DateTime`.

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

**См. также**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
