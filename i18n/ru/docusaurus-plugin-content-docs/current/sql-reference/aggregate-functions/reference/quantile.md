---
description: 'Вычисляет приблизительный квантиль числовой последовательности данных.'
sidebar_position: 170
slug: /sql-reference/aggregate-functions/reference/quantile
title: 'квантиль'
---


# квантиль

Вычисляет приблизительный [квантиль](https://en.wikipedia.org/wiki/Quantile) числовой последовательности данных.

Эта функция применяет [резервуарное выбор sampling](https://en.wikipedia.org/wiki/Reservoir_sampling) с размером резервуара до 8192 и генератор случайных чисел для выборки. Результат является недетерминированным. Чтобы получить точный квантиль, используйте функцию [quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact).

При использовании нескольких функций `quantile*` с различными уровнями в запросе внутренние состояния не объединяются (то есть запрос работает менее эффективно, чем мог бы). В этом случае используйте функцию [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles).

Обратите внимание, что для пустой числовой последовательности `quantile` вернет NaN, но его варианты `quantile*` будут возвращать либо NaN, либо значение по умолчанию для типа последовательности, в зависимости от варианта.

**Синтаксис**

```sql
quantile(level)(expr)
```

Псевдоним: `median`.

**Аргументы**

- `level` — Уровень квантиля. Необязательный параметр. Константное число с плавающей запятой от 0 до 1. Рекомендуется использовать значение `level` в диапазоне `[0.01, 0.99]`. Значение по умолчанию: 0.5. При `level=0.5` функция вычисляет [медиану](https://en.wikipedia.org/wiki/Median).
- `expr` — Выражение над значениями столбца, результатом которого являются числовые [типы данных](/sql-reference/data-types), [Date](/sql-reference/data-types/date) или [DateTime](/sql-reference/data-types/datetime).

**Возвращаемое значение**

- Приблизительный квантиль указанного уровня.

Тип:

- [Float64](/sql-reference/data-types/float) для числового типа данных на входе.
- [Date](/sql-reference/data-types/date), если входные значения имеют тип `Date`.
- [DateTime](/sql-reference/data-types/datetime), если входные значения имеют тип `DateTime`.

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
SELECT quantile(val) FROM t
```

Результат:

```text
┌─quantile(val)─┐
│           1.5 │
└───────────────┘
```

**Смотрите также**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](/sql-reference/aggregate-functions/reference/quantiles#quantiles)
